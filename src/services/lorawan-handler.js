import loraPacket from 'lora-packet';
import {cayenneBufferDecoder, cayenneEncoder} from 'aloes-handlers';
//  import {promisify} from 'util';
import logger from './logger';
import utils from './utils';

/**
 * @module loraWanHandler
 */
//  const asyncFromWire = promisify(loraPacket.fromWire);

/**
 * @method
 * @param {object} buffer - Buffer containing LoRaPacket.
 * @returns {object} packet
 */
const decodePacket = buffer => {
  const packet = loraPacket.fromWire(buffer);
  // const packetIsOk = loraPacket.calculateMIC(packet);
  return packet;
};

/**
 * @param {object} packet - LoRaPacket.
 * @param {object} appSKey - LoraWAN AppSKey.
 * @param {object} nwkSKey - LoraWAN NwkSKey.
 * @returns {object} packet - {loraPacket, caynnePayload}
 */
const parseCayennePayload = async (packet, appSKey, nwkSKey) => {
  try {
    if (typeof nwkSKey !== 'object' || typeof nwkSKey === 'string') {
      nwkSKey = Buffer.from(nwkSKey, 'hex');
    }
    if (typeof appSKey !== 'object' || typeof appSKey === 'string') {
      appSKey = Buffer.from(appSKey, 'hex');
    }
    const decodedPacket = await loraPacket.decrypt(packet, appSKey, nwkSKey);

    const decoder = await cayenneBufferDecoder(decodedPacket);
    const cayennePayload = {...decoder};
    logger.publish(
      4,
      'Lora-Decoder',
      'decodedCayennePayload:res :',
      cayennePayload,
    );
    return {decodedPacket, cayennePayload};
  } catch (error) {
    logger.publish(4, 'Lora-Decoder', 'parsePayload:err', error);
    return error;
  }
};

/**
 * @method
 * @param {object} sensor - AloesClient sensor instance.
 * @returns {object} cayennePayload
 */
const buildCayennePayload = async sensor => {
  try {
    const cayennePayload = await cayenneEncoder(sensor);
    return cayennePayload;
  } catch (error) {
    logger.publish(4, 'Lora-Decoder', 'buildCayennePayload:err', error);
    return error;
  }
};

/**
 * @param {object} packet - LoRaPacket.
 * @param {object} appKey - LoraWAN appKey.
 * @param {number} netID - LoraWAN netID.
 * @returns {object} decoded - {appNonce, netID, nwkSKey, appSKey}
 */
const resolveJoinRequest = (packet, appKey, netID) => {
  try {
    if (typeof appKey === 'object' && appKey instanceof Buffer) {
      appKey = appKey.toString('hex');
    }
    logger.publish(4, 'Lora-Decoder', 'resolveJoinRequest:req :', {
      devEui: packet.getBuffers().DevEUI.toString('hex'),
      appKey,
      devNonce: packet.getBuffers().DevNonce.toString('hex'),
    });
    const appNonce = utils.getRandomNumber(6).toString();
    netID = 'aabbcc'; // todo get it from broker response
    const sessionKeys = loraPacket.generateSessionKeys(
      Buffer.from(appKey, 'hex'),
      Buffer.from(netID, 'hex'),
      Buffer.from(appNonce, 'hex'),
      packet.getBuffers().DevNonce,
    );
    logger.publish(4, 'Lora-Decoder', 'resolveJoinRequest:res', sessionKeys);
    const nwkSKey = sessionKeys.NwkSKey.toString('hex');
    const appSKey = sessionKeys.AppSKey.toString('hex');
    return {appNonce, netID, nwkSKey, appSKey};
  } catch (error) {
    logger.publish(4, 'Lora-Decoder', 'resolveJoinRequest:err', error);
    return error;
  }
};

/**
 * @param {object} options - Options containing LoRaWAN full Packet parameters.
 * @returns {object} txpk
 */
const buildPacket = options => {
  try {
    if (
      !options ||
      !options.devAddr ||
      !options.nwkSKey ||
      !options.appSKey ||
      !options.mType
    ) {
      return new Error('missing options');
    }
    logger.publish(4, 'Lora-decoder', 'buildPacket:req :', {
      devAddr: options.devAddr,
      appSKey: options.appSKey,
      nwkSKey: options.nwkSKey,
      MType: options.mType,
    });

    if (
      typeof options.nwkSKey === 'object' &&
      options.nwkSKey instanceof Buffer
    ) {
      options.nwkSKey = options.nwkSKey.toString('hex');
    }
    if (
      typeof options.appSKey === 'object' &&
      options.appSKey instanceof Buffer
    ) {
      options.appSKey = options.appSKey.toString('hex');
    }
    let packet;
    const txpk = {
      imme: options.imme || true,
      tmst: options.tmst || Date.now() + 50,
      tmms: options.tmms || Date.now() + 100,
      freq: options.freq || 868.3,
      rfch: options.rfch || 0,
      powe: options.powe || 14,
      modu: options.modu || 'LORA',
      datr: options.datr || 'SF12BW500',
      codr: options.codr || '4/5',
      fdev: options.fdev || 3000,
      ncrc: options.ncrc || false,
      ipol: options.ipol || true,
      prea: options.prea || 0,
    };

    switch (options.mType) {
      case 'Join Request':
        packet = {
          MType: 0,
          DevAddr: Buffer.from(options.devAddr, 'hex'), // big-endian
          FCtrl: {
            ADR: false, // default = false
            ACK: true, // default = false
            ADRACKReq: false, // default = false
            FPending: false, // default = false
          },
          FCnt: options.frameCounter || Buffer.from('0003', 'hex'), // can supply a buffer or a number
          payload: options.payload || 'test',
          DevNonce: Buffer.from(options.appNonce, 'hex'),
          AppEUI: Buffer.from(options.appEui, 'hex'),
          DevEUI: Buffer.from(options.devEui, 'hex'),
        };
        txpk.imme = true;
        break;
      case 'Join Accept':
        packet = {
          //  MType: "Join Accept",
          MType: 1,
          DevAddr: Buffer.from(options.devAddr, 'hex'), // big-endian
          FCtrl: {
            ADR: false, // default = false
            ACK: true, // default = false
            ADRACKReq: false, // default = false
            FPending: false, // default = false
          },
          FCnt: options.frameCounter || Buffer.from('0003', 'hex'), // can supply a buffer or a number
          payload: options.payload || 'test',
          AppNonce: Buffer.from(options.appNonce, 'hex'),
          NetID: Buffer.from(options.netID, 'hex'),
          AppEUI: Buffer.from(options.appEui, 'hex'),
          DevEUI: Buffer.from(options.devEui, 'hex'),
          // DLSettings,
          // RxDelay,
          // CFList,
        };
        txpk.imme = false;
        txpk.tmst = Date.now() + 100;
        txpk.ipol = true;
        break;
      case 'Unconfirmed Data Up':
        packet = {
          MType: 2,
          DevAddr: Buffer.from(options.devAddr, 'hex'), // big-endian
          FCtrl: {
            ADR: false, // default = false
            ACK: true, // default = false
            ADRACKReq: false, // default = false
            FPending: false, // default = false
          },
          FCnt: options.frameCounter || Buffer.from('0003', 'hex'), // can supply a buffer or a number
          payload: options.payload || 'test',
        };
        break;
      case 'Unconfirmed Data Down':
        packet = {
          MType: 3,
          DevAddr: Buffer.from(options.devAddr, 'hex'), // big-endian
          FCtrl: {
            ADR: false, // default = false
            ACK: false, // default = false
            ADRACKReq: false, // default = false
            FPending: false, // default = false
          },
          FCnt: options.frameCounter || Buffer.from('0003', 'hex'), // can supply a buffer or a number
          payload: options.payload || 'test',
        };
        txpk.imme = false;
        txpk.tmst = Date.now() + 50;
        txpk.ipol = true;
        break;
      case 'Confirmed Data Up':
        packet = {
          MType: 4,
          DevAddr: Buffer.from(options.devAddr, 'hex'), // big-endian
          FCtrl: {
            ADR: false, // default = false
            ACK: true, // default = false
            ADRACKReq: false, // default = false
            FPending: false, // default = false
          },
          FCnt: options.frameCounter || Buffer.from('0003', 'hex'), // can supply a buffer or a number
          payload: options.payload || 'test',
        };
        break;
      case 'Confirmed Data Down':
        packet = {
          MType: 5,
          DevAddr: Buffer.from(options.devAddr, 'hex'), // big-endian
          FCtrl: {
            ADR: false, // default = false
            ACK: true, // default = false
            ADRACKReq: false, // default = false
            FPending: false, // default = false
          },
          FCnt: options.frameCounter || Buffer.from('0003', 'hex'), // can supply a buffer or a number
          payload: options.payload || 'test',
        };
        txpk.imme = false;
        txpk.tmst = Date.now() + 100;
        txpk.ipol = true;
        break;
      default:
        packet = '';
    }
    if (!packet) return new Error('Error while building LoraWAN packet');

    if (options.appKey) {
      if (
        typeof options.appKey === 'object' &&
        options.appKey instanceof Buffer
      ) {
        options.appKey = options.appKey.toString('hex');
      }
      const constructedPacket = loraPacket.fromFields(
        packet,
        Buffer.from(options.appSKey, 'hex'), // AppSKey
        Buffer.from(options.nwkSKey, 'hex'), // NwkSKey
        Buffer.from(options.appKey, 'hex'), // AppKey
      );
      txpk.data = constructedPacket.getPHYPayload().toString('base64');
    } else {
      const constructedPacket = loraPacket.fromFields(
        packet,
        Buffer.from(options.appSKey, 'hex'), // AppSKey
        Buffer.from(options.nwkSKey, 'hex'), // NwkSKey
      );
      txpk.data = constructedPacket.getPHYPayload().toString('base64');
    }

    logger.publish(3, 'Lora-decoder', 'buildPacket:res', txpk.data);
    return txpk;
  } catch (error) {
    logger.publish(4, 'Lora-decoder', 'buildPacket:err', error);
    return error;
  }
};

const loraWanHandler = {
  decodePacket,
  parseCayennePayload,
  buildCayennePayload,
  resolveJoinRequest,
  buildPacket,
};

export default loraWanHandler;
