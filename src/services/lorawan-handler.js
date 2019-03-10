import loraPacket from 'lora-packet';
import {cayenneDecoder, cayenneEncoder} from 'cayennelpp-handlers';
//  import {promisify} from 'util';
import logger from './logger';
import utils from './utils';

/**
 * LoraWan Application Packet handler, using lora-packet.js
 * @namespace loraWanHandler
 */
export const loraWanHandler = {};

//  const asyncFromWire = promisify(loraPacket.fromWire);

/**
 * @method
 * @param {object} payload - PHYpayload as base64 string.
 * @returns {object} packet
 */
loraWanHandler.decodePacket = async payload => {
  try {
    logger.publish(4, 'Lora-Handler', 'decodePacket:req', payload);
    const buffer = Buffer.from(payload, 'Base64');
    const packet = loraPacket.fromWire(buffer);
    // const packetIsOk = loraPacket.calculateMIC(packet);
    logger.publish(4, 'Lora-Handler', 'decodePacket:res', packet);
    return packet;
  } catch (error) {
    logger.publish(4, 'Lora-Handler', 'decodePacket:err', error);
    return error;
  }
};

/**
 * @param {object} packet - LoRaPacket.
 * @param {object} appSKey - LoraWAN AppSKey.
 * @param {object} nwkSKey - LoraWAN NwkSKey.
 * @returns {object} packet - {loraPacket, caynnePayload}
 */
loraWanHandler.parseCayennePayload = async (
  packet,
  appSKey,
  nwkSKey,
  protocol,
) => {
  try {
    logger.publish(4, 'Lora-Handler', 'parseCayennePayload:req', {
      appSKey,
      nwkSKey,
    });
    if (typeof nwkSKey !== 'object' || typeof nwkSKey === 'string') {
      nwkSKey = Buffer.from(nwkSKey, 'hex');
    }
    if (typeof appSKey !== 'object' || typeof appSKey === 'string') {
      appSKey = Buffer.from(appSKey, 'hex');
    }
    const decodedPacket = await loraPacket.decrypt(packet, appSKey, nwkSKey);
    const decoder = await cayenneDecoder(decodedPacket, protocol);
    const cayennePayload = {...decoder};
    logger.publish(
      4,
      'Lora-Handler',
      'parseCayennePayload:res',
      cayennePayload,
    );
    return {decodedPacket, cayennePayload};
  } catch (error) {
    logger.publish(4, 'Lora-Handler', 'parseCayennePayload:err', error);
    return error;
  }
};

/**
 * @method
 * @param {object} sensor - AloesClient sensor instance.
 * @returns {object} cayennePayload
 */
loraWanHandler.buildCayennePayload = async sensor => {
  try {
    const cayennePayload = await cayenneEncoder(sensor);
    return cayennePayload;
  } catch (error) {
    logger.publish(4, 'Lora-Handler', 'buildCayennePayload:err', error);
    return error;
  }
};

/**
 * Compose sensor collection based on aloes client schema
 * @param {object} node - Found device instance
 * @param {object} cayennePayload - Decoded cayenne payload
 * @fires module:loraWanApp~RX
 * @returns {array} sensors
 */
loraWanHandler.updateCayenneSensors = async (node, cayennePayload) => {
  try {
    logger.publish(4, 'Lora-Handler', 'updateCayenneSensors:req', {node});
    // const devAddr = packet.getBuffers().DevAddr.toString('hex');
    const sensors = await Object.keys(cayennePayload).map(channel => {
      if (channel) {
        const type = cayennePayload[channel].type;
        const key = `sensor-${type}-${channel}`;
        if (!Object.prototype.hasOwnProperty.call(node, key)) {
          node[key] = cayennePayload[channel];
          node[key].deviceId = node.id;
          node[key].devEui = node.devEui || null;
          node[key].devAddr = node.devAddr;
          node[key].transportProtocol = node.transportProtocol;
          node[key].messageProtocol = node.messageProtocol;
          return {[key]: node[key]};
        }
        node[key] = {
          ...node[key],
          ...cayennePayload[channel],
        };
        return {[key]: node[key]};
      }
      return {};
    });
    return sensors;
  } catch (error) {
    logger.publish(2, 'Lora-Handler', 'updateCayenneSensors:err', error);
    return error;
  }
};

/**
 * @param {object} packet - LoRaPacket.
 * @param {string} appKey - LoraWAN appKey.
 * @param {number} netID - LoraWAN netID.
 * @returns {object} decoded - {appNonce, netID, nwkSKey, appSKey}
 */
loraWanHandler.resolveJoinRequest = (packet, appKey, netID) => {
  try {
    if (typeof appKey === 'object' && appKey instanceof Buffer) {
      appKey = appKey.toString('hex');
    }
    logger.publish(4, 'Lora-Handler', 'resolveJoinRequest:req :', {
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
    const nwkSKey = sessionKeys.NwkSKey.toString('hex');
    const appSKey = sessionKeys.AppSKey.toString('hex');
    const result = {appNonce, netID, nwkSKey, appSKey, appKey};
    logger.publish(4, 'Lora-Handler', 'resolveJoinRequest:res', result);
    return result;
  } catch (error) {
    logger.publish(4, 'Lora-Handler', 'resolveJoinRequest:err', error);
    return error;
  }
};

/**
 * @param {object} options - Options containing LoRaWAN full Packet parameters.
 * @param {string} options.devAddr - LoraWan DevAddr.
 * @param {string} options.nwkSKey - LoraWan NwkSKey.
 * @param {string} options.appSKey - LoraWan AppSKey.
 * @param {string} options.mType - LoraWan MType.
 * @returns {object} txpk
 */
loraWanHandler.buildPacket = async options => {
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
    logger.publish(4, 'Lora-Handler', 'buildPacket:req', {
      devAddr: options.devAddr,
      appSKey: options.appSKey,
      nwkSKey: options.nwkSKey,
      MType: options.mType,
    });

    // if (
    //   typeof options.nwkSKey === 'object' &&
    //   options.nwkSKey instanceof Buffer
    // ) {
    //   options.nwkSKey = options.nwkSKey.toString('hex');
    // }
    // if (
    //   typeof options.appSKey === 'object' &&
    //   options.appSKey instanceof Buffer
    // ) {
    //   options.appSKey = options.appSKey.toString('hex');
    // }
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

    logger.publish(3, 'Lora-Handler', 'buildPacket:res', txpk);

    switch (options.mType) {
      case 'Join Request':
        packet = {
          //  MType: 0,
          MType: options.mType,
          DevAddr: Buffer.from(options.devAddr, 'hex'), // big-endian
          FCtrl: {
            ADR: false, // default = false
            ACK: true, // default = false
            ADRACKReq: false, // default = false
            FPending: false, // default = false
          },
          FCnt: options.frameCounter || Buffer.from('0001', 'hex'), // can supply a buffer or a number
          payload: options.payload || 'test',
          DevNonce: Buffer.from(options.appNonce, 'hex'),
          AppEUI: Buffer.from(options.joinEui, 'hex'),
          DevEUI: Buffer.from(options.devEui, 'hex'),
        };
        txpk.imme = true;
        break;
      case 'Join Accept':
        packet = {
          MType: options.mType,
          DevAddr: Buffer.from(options.devAddr, 'hex'), // big-endian
          //  DevAddr: options.devAddr,
          FCtrl: {
            ADR: false, // default = false
            ACK: true, // default = false
            ADRACKReq: false, // default = false
            FPending: false, // default = false
          },
          FCnt: options.frameCounter || Buffer.from('0002', 'hex'), // can supply a buffer or a number
          payload: options.payload || 'test',
          AppNonce: Buffer.from(options.appNonce, 'hex'),
          NetID: Buffer.from(options.netID, 'hex'),
          AppEUI: Buffer.from(options.joinEui, 'hex'),
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
          MType: options.mType,
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
          MType: options.mType,
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
          MType: options.mType,
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
          MType: options.mType,
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
      // if (
      //   typeof options.appKey === 'object' &&
      //   options.appKey instanceof Buffer
      // ) {
      //   options.appKey = options.appKey.toString('hex');
      // }
      const constructedPacket = loraPacket.fromFields(
        packet,
        Buffer.from(options.appSKey, 'hex'), // AppSKey
        Buffer.from(options.nwkSKey, 'hex'), // NwkSKey
        Buffer.from(options.appKey, 'hex'), // AppKey
      );
      txpk.data = constructedPacket.getPHYPayload().toString('base64');
    } else {
      const constructedPacket = await loraPacket.fromFields(
        packet,
        Buffer.from(options.appSKey, 'hex'), // AppSKey
        Buffer.from(options.nwkSKey, 'hex'), // NwkSKey
      );
      txpk.data = constructedPacket.getPHYPayload().toString('base64');
    }
    logger.publish(3, 'Lora-Handler', 'buildPacket:res', txpk);
    return txpk;
  } catch (error) {
    logger.publish(4, 'Lora-Handler', 'buildPacket:err', error);
    return error;
  }
};

/**
 * Compose a Join Accept packet
 * @param {object} message - LoraWan Application message
 * @param {string} appKey - Device AppKey
 * @param {object} packet - LoraWan Application packet
 * @param {object} networkOptions - LoraWan Application network config
 * @returns {object} txpk
 */
loraWanHandler.buildJoinAccept = async (message, packet, networkOptions) => {
  // add netID to the payload ( put it device-manager lorawan app config )
  try {
    logger.publish(4, 'Lora-Handler', 'buildJoinAccept:req', {message});
    const keys = await loraWanHandler.resolveJoinRequest(
      packet,
      message.node.appKey,
    );
    if (!keys.nwkSKey || !keys.appSKey || !keys.netID || !keys.appNonce) {
      return new Error('Error : Invalid keys');
    }
    const devAddr = utils.getRandomNumber(8).toString();
    const txpk = await loraWanHandler.buildPacket({
      devAddr,
      devEui: message.node.devEui,
      joinEui: message.node.joinEui,
      mType: 'Join Accept',
      ...networkOptions,
      ...keys,
    });
    if (!txpk || txpk === null) {
      return new Error('Error : Invalid packet');
    }
    return {keys, txpk};
  } catch (error) {
    logger.publish(2, 'Lora-Handler', 'buildJoinAccept:err', error);
    return error;
  }
};
