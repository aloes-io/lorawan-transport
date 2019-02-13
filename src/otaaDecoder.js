/*
 * Shows how to decode a LoRaWAN OTAA Join Accept message, and derive the session keys.
 *
 * For a not-encrypted Join Request like 00DC0000D07ED5B3701E6FEDF57CEEAF0085CC587FE913
 * https://github.com/anthonykirby/lora-packet correctly shows:
 *
 *     Message Type = Join Request
 *           AppEUI = 70B3D57ED00000DC
 *           DevEUI = 00AFEE7CF5ED6F1E
 *         DevNonce = CC85
 *              MIC = 587FE913
 *
 * For its response, 204DD85AE608B87FC4889970B7D2042C9E72959B0057AED6094B16003DF12DE145,
 * it currently erroneously suggests:
 *
 *     Message Type = Join Accept
 *         AppNonce = 5AD84D
 *            NetID = B808E6
 *          DevAddr = 9988C47F
 *              MIC = F12DE145
 *
 * However, the Join Accept payload (including its MIC) is encrypted using the secret
 * AppKey (not to be confused with the AppSKey, which is actually derived from the Join
 * Accept). When decrypted using B6B53F4A168A7A88BDF7EA135CE9CFCA, the above Join Accept
 * would yield:
 *
 *     Message Type = Join Accept
 *         AppNonce = E5063A
 *            NetId = 000013
 *          DevAddr = 26012E43
 *       DLSettings = 03
 *          RXDelay = 01
 *           CFList = 184F84E85684B85E84886684586E8400
 *                  = decimal 8671000, 8673000, 8675000, 8677000, 8679000
 *              MIC = 55121DE0
 *
 * (The Things Network has been assigned a 7-bits "device address prefix" a.k.a. NwkID
 * %0010011. Using that, TTN currently sends NetID 0x000013, and a TTN DevAddr always
 * starts with 0x26 or 0x27.)
 *
 * When the DevNonce from the Join Request is known as well, then the session keys can
 * be derived:
 *
 *          NwkSKey = 2C96F7028184BB0BE8AA49275290D4FC
 *          AppSKey = F3A5C8F0232A38C144029C165865802C
 */

import reverse from 'buffer-reverse';
import CryptoJS from 'crypto-js';
import aesCmac from 'node-aes-cmac';
//    import {promisify} from 'util';
import logger from './logger';

//    var aesCmac = require('node-aes-cmac').aesCmac;

// const aesCmacAsync = promisify(aesCmac).bind(aesCmac);
// const reverseAsync = promisify(reverse).bind(reverse);

// Initialization vector is always zero
const LORA_IV = CryptoJS.enc.Hex.parse('00000000000000000000000000000000');

const otaaDecoder = {};

// Encrypts the given buffer, returning another buffer.
otaaDecoder.encrypt = (buffer, key) =>
  new Promise((resolve, reject) => {
    const ciphertext = CryptoJS.AES.encrypt(
      CryptoJS.lib.WordArray.create(buffer),
      CryptoJS.lib.WordArray.create(key),
      {
        mode: CryptoJS.mode.ECB,
        iv: LORA_IV,
        padding: CryptoJS.pad.NoPadding,
      },
    ).ciphertext.toString(CryptoJS.enc.Hex);
    if (ciphertext) resolve(new Buffer(ciphertext, 'hex'));
    reject(new Error('Error while encrypting buffer'));
  });

otaaDecoder.decrypt = async (phyPayload, devNonce, appKey) => {
  try {
    logger.publish(4, 'Server', 'decrypt:req', appKey);

    // ## Decrypt payload, including MIC
    //
    // The network server uses an AES decrypt operation in ECB mode to encrypt the join-accept
    // message so that the end-device can use an AES encrypt operation to decrypt the message.
    // This way an end-device only has to implement AES encrypt but not AES decrypt.
    const mhdr = phyPayload.slice(0, 1);
    const joinAccept = await otaaDecoder.encrypt(phyPayload.slice(1), appKey);
    logger.publish(4, 'Server', 'decrypt:req', joinAccept);

    // ## Decode fields
    //
    // Size (bytes):     3       3       4         1          1     (16) Optional   4
    // Join Accept:  AppNonce  NetID  DevAddr  DLSettings  RxDelay      CFList     MIC
    let i = 0;
    let rfu;
    let cfList;
    const appNonce = joinAccept.slice(i, (i += 3));
    const netID = joinAccept.slice(i, (i += 3));
    const devAddr = joinAccept.slice(i, (i += 4));
    const dlSettings = joinAccept.slice(i, (i += 1));
    const rxDelay = joinAccept.slice(i, (i += 1));
    const frequencies = [];

    if (i + 4 < joinAccept.length) {
      // We need the complete little-endian list (including its RFU byte) for the MIC
      cfList = joinAccept.slice(i, (i += 16));
      // Decode the 5 additional channel frequencies
      for (let c = 0; c < 5; c += 1) {
        frequencies.push(cfList.readUIntLE(3 * c, 3));
      }
      rfu = cfList.slice(15, 15 + 1);
    }
    const mic = joinAccept.slice(i, (i += 4));

    // ## Validate MIC
    //
    // Below, the AppNonce, NetID and all should be added in little-endian format.
    // cmac = aes128_cmac(AppKey, MHDR|AppNonce|NetID|DevAddr|DLSettings|RxDelay|CFList)
    // MIC = cmac[0..3]
    const micVerify = aesCmac(
      appKey,
      Buffer.concat([
        mhdr,
        appNonce,
        netID,
        devAddr,
        dlSettings,
        rxDelay,
        cfList,
      ]),
      {returnAsBuffer: true},
    ).slice(0, 4);

    // ## Derive session keys
    //
    // NwkSKey = aes128_encrypt(AppKey, 0x01|AppNonce|NetID|DevNonce|pad16)
    // AppSKey = aes128_encrypt(AppKey, 0x02|AppNonce|NetID|DevNonce|pad16)
    const sKey = Buffer.concat([
      appNonce,
      netID,
      reverse(devNonce),
      Buffer.from('00000000000000', 'hex'),
    ]);
    const nwkSKey = await otaaDecoder.encrypt(
      Buffer.concat([Buffer.from('01', 'hex'), sKey]),
      appKey,
    );
    const appSKey = await otaaDecoder.encrypt(
      Buffer.concat([Buffer.from('02', 'hex'), sKey]),
      appKey,
    );

    const response = `Payload =  ${phyPayload.toString('hex')}
  MHDR = ${mhdr.toString('hex')}
  Join Accept =  ${joinAccept.toString('hex')}
  AppNonce =  ${reverse(appNonce).toString('hex')}
  NetID =  ${reverse(netID).toString('hex')}
  DevAddr =  ${reverse(devAddr).toString('hex')}
  DLSettings =  ${dlSettings.toString('hex')}
  RXDelay =  ${rxDelay.toString('hex')}
  CFList =  ${cfList.toString('hex')}
   = decimal =  ${frequencies.join(', ')}; RFU ${rfu.toString('hex')}
  message MIC =  ${mic.toString('hex')}
  nverified MIC =  ${micVerify.toString('hex')}
  NwkSKey =  ${nwkSKey.toString('hex')}
  AppSKey =  ${appSKey.toString('hex')}`;

    return `<pre>\n  ${response} \n</pre>`;
  } catch (error) {
    return error;
  }
};

export default otaaDecoder;
