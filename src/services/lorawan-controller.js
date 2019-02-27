import EventEmitter from 'events';
import LoraWanServer from './lorawan-server';
import loraWanHandler from './lorawan-handler';
import logger from './logger';
import utils from './utils';

/**
 * loraWan Application
 * @module loraWanApp
 */

export const loraWanApp = new EventEmitter();

const gateways = {
  '23299492': {
    id: null,
    mac: '23299492',
    protocolName: 'test',
    protocolVersion: '0',
    latitude: '',
    longitude: '',
  },
};
const nodes = {
  '234243242': {
    id: null,
    auth: 'OTAA',
    protocolName: '',
    protocolVersion: '',
    packet: null,
    gwId: '23299492',
    devEui: '234243242',
    'sensor-3200-0': {
      id: null,
      packet: null,
      protocolName: 'cayenneLPP',
      protocolVersion: '',
      name: 'Digital output',
      icons: [],
      colors: null,
      nativeType: 0,
      nativeResource: 5500,
      nativeSensorId: 0,
      type: 3200,
      resources: {'5500': 0, '5501': 1},
      resource: 5500,
      value: 0,
      frameCounter: 0,
    },
  },
};

const networkOptions = {
  imme: true,
  freq: 867.5,
  rfch: 0,
  powe: 14,
  datr: 'SF12BW500',
  codr: '4/5',
  ncrc: false,
  ipol: false,
  minFreq: 863,
  maxFreq: 870,
};

/**
 * Parse received packet from LoraWan Gateways
 * @param {object} message - Parsed JSON
 * @fires module:loraWanApp~RX
 */
const parseRXLoraPacket = async message => {
  try {
    const pdata = message.data.rxpk[0].data;
    const buffer = Buffer.from(pdata, 'Base64');
    const packet = await loraWanHandler.decodePacket(buffer);
    logger.publish(
      4,
      'Lora-Server',
      `${message.type} ${message.direction}`,
      packet.getMType().toString('hex'),
    );
    if (packet.getBuffers().PHYPayload) {
      if (packet.getBuffers().DevEUI && packet.getBuffers().DevNonce) {
        const devEui = packet.getBuffers().DevEUI.toString('hex');
        if (!Object.prototype.hasOwnProperty.call(nodes, devEui)) {
          nodes[devEui] = {
            auth: 'OTAA',
            protocolName: '',
            protocolVersion: '',
            gwId: message.gateway,
            devEui,
          };
        }
        nodes[devEui].type = packet.getMType().toString('hex');
        nodes[devEui].appEui = packet.getBuffers().AppEUI.toString('hex');
        nodes[devEui].packet = packet.getPHYPayload().toString('hex');
        nodes[devEui].lastPush = packet.getPHYPayload().toString('hex');
        nodes[devEui].lastSignal = new Date();
        nodes[devEui].frameCounter = packet.getFCnt();

        return loraWanApp.emit(message.direction, {
          gateway: gateways[message.gateway],
          type: message.type,
          direction: message.direction,
          node: nodes[devEui],
        });
      } else if (packet.getBuffers().DevAddr) {
        const devAddr = packet.getBuffers().DevAddr.toString('hex');
        if (!Object.prototype.hasOwnProperty.call(nodes, devAddr)) {
          nodes[devAddr] = {
            auth: 'ABP',
            protocolName: '',
            protocolVersion: '',
            gwId: message.gateway,
            devAddr,
          };
        }
        nodes[devAddr].type = packet.getMType().toString('hex');
        nodes[devAddr].packet = packet.getPHYPayload().toString('hex');
        nodes[devAddr].lastPush = packet.getPHYPayload().toString('hex');
        nodes[devAddr].lastSignal = new Date();
        nodes[devAddr].frameCounter = packet.getFCnt();

        return loraWanApp.emit(message.direction, {
          gateway: gateways[message.gateway],
          type: message.type,
          direction: message.direction,
          node: nodes[devAddr],
        });
      }
      return new Error('Error: No device found');
    }
    return new Error('Error: Invalid lora payload');
  } catch (error) {
    return error;
  }
};

/**
 * Parse sent packet to LoraWan Gateways
 * @param {object} message - Parsed JSON
 * @fires module:loraWanApp~TX
 */
const parseTXLoraPacket = async message => {
  const pdata = message.txpk.data;
  const buffer = Buffer.from(pdata, 'base64');
  const packet = await loraWanHandler.decodePacket(buffer);
  logger.publish(
    4,
    'Lora-Server',
    `${message.type} ${message.direction}`,
    packet.getMType().toString('hex'),
  );
  // if payload's correct send it to mqtt client
  if (packet.getBuffers().PHYPayload && packet.getBuffers().DevEUI) {
    const devEui = packet.getBuffers().DevEUI.toString('hex');
    if (!Object.prototype.hasOwnProperty.call(nodes, devEui)) {
      return null;
    }
    nodes[devEui].type = packet.getMType().toString('hex');
    nodes[devEui].packet = packet.getPHYPayload().toString('hex');
    nodes[devEui].lastPull = packet.getPHYPayload().toString('hex');
    nodes[devEui].lastSignal = new Date();
    nodes[devEui].frameCounter = packet.getFCnt();

    return loraWanApp.emit(message.direction, {
      gateway: gateways[message.gateway],
      type: message.type,
      direction: message.direction,
      node: nodes[devEui],
    });
  } else if (packet.getBuffers().DevAddr) {
    const devAddr = packet.getBuffers().DevAddr.toString('hex');
    if (!Object.prototype.hasOwnProperty.call(nodes, devAddr)) {
      return null;
    }
    nodes[devAddr].type = packet.getMType().toString('hex');
    nodes[devAddr].packet = packet;
    nodes[devAddr].lastPull = packet;
    nodes[devAddr].lastSignal = new Date();
    nodes[devAddr].frameCounter = packet.getFCnt();
    return loraWanApp.emit(message.direction, {
      gateway: gateways[message.gateway],
      type: message.type,
      direction: message.direction,
      node: nodes[devAddr],
    });
  }
  return null;
};

/**
 * Parse message coming from LoraWan Gateways
 * @param {string} type - Message type.
 * @param {object} message - Parsed UDP packet
 * @param {object} clientInfo - Gateway infos
 */
const parseServerMessage = (type, message, clientInfo) => {
  if (
    type &&
    clientInfo &&
    clientInfo.port &&
    clientInfo.address &&
    message &&
    message.gateway
  ) {
    if (!Object.prototype.hasOwnProperty.call(gateways, message.gateway)) {
      gateways[message.gateway] = {
        mac: message.gateway,
        protocolName: 'loraWan',
        protocolVersion: message.protocol,
      };
    }
    switch (type) {
      case 'pushack':
        gateways[message.gateway].portup = clientInfo.port;
        gateways[message.gateway].address = clientInfo.address;
        gateways[message.gateway].latitude = '';
        gateways[message.gateway].longitude = '';
        logger.publish(4, 'Lora-Server', 'pushack:res', {
          address: gateways[message.gateway].address,
          port: gateways[message.gateway].portup,
        });
        break;
      case 'pullack':
        gateways[message.gateway].portdown = clientInfo.port;
        gateways[message.gateway].address = clientInfo.address;
        gateways[message.gateway].latitude = '';
        gateways[message.gateway].longitude = '';
        logger.publish(4, 'Lora-Server', 'pullack:res', {
          address: gateways[message.gateway].address,
          port: gateways[message.gateway].portdown,
        });
        break;
      case 'txack':
        if (Object.prototype.hasOwnProperty.call(gateways, message.gateway)) {
          loraWanApp.emit('status', {
            gateway: gateways[message.gateway],
            type: message.type,
            direction: message.direction,
            payload: message.data,
          });
          logger.publish(4, 'Lora-Server', 'txack:res', {
            address: gateways[message.gateway].address,
            port: gateways[message.gateway].portdown,
            error: message.data,
          });
        }
        break;
      case 'pushdata:rxpk':
        parseRXLoraPacket();
        break;
      case 'pullresp:txpk':
        parseTXLoraPacket();
        break;
      default:
        return null;
    }
  }
  return null;
};

/**
 * Listen to LoraWan Gateways events
 * @param {object} server - LoraWan Server instance
 */
const setServerListeners = server => {
  /**
   * @event module:loraWanServer~error
   * @param {object} client - Client config.
   * @param {object} err - Connection error.
   * @fires module:loraWanApp~error
   */
  server.on('error', (client, err) => {
    loraWanApp.emit('error', err);
  });

  /**
   * @event module:loraWanServer~ready
   * @param {object} client - Client config.
   * @param {object} info - Connection details.
   * @fires module:loraWanApp~status
   */
  server.on('ready', (client, info) => {
    loraWanApp.emit('status', client, info);
  });

  /**
   * @event module:loraWanServer~close
   * @param {object} client - Client config.
   * @param {object} info - Connection details.
   * @fires module:loraWanApp~status
   */
  server.on('close', (client, info) => {
    loraWanApp.emit('status', client, info);
  });

  /**
   * @event module:loraWanServer~pushdata:status
   * @param {object} message - LoraWan full message.
   * @param {object} clientInfo - Client config.
   * @fires module:loraWanApp~status
   */
  server.on('pushdata:status', (message, clientInfo) => {
    logger.publish(4, 'Lora-Server', 'status :', {message, clientInfo});
    if (Object.prototype.hasOwnProperty.call(gateways, message.gateway)) {
      loraWanApp.emit('status', {
        gateway: gateways[message.gateway],
        type: message.type,
        direction: message.direction,
        payload: message.data.stat,
      });
    }
  });

  /**
   * @event module:loraWanServer~pushack
   * @param {object} message - LoraWan full message.
   * @param {object} clientInfo - Client config.
   */
  server.on('pushack', (message, clientInfo) => {
    parseServerMessage('pushack', message, clientInfo);
  });

  /**
   * @event module:loraWanServer~pullack
   * @param {object} message - LoraWan full message.
   * @param {object} clientInfo - Client config.
   */
  server.on('pullack', (message, clientInfo) => {
    parseServerMessage('pullack', message, clientInfo);
  });

  /**
   * @event module:loraWanServer~txack
   * @param {object} message - LoraWan full message.
   * @param {object} clientInfo - Client config.
   */
  server.on('txack', (message, clientInfo) => {
    parseServerMessage('txack', message, clientInfo);
  });

  /**
   * @event module:loraWanServer~pushdata:rxpk
   * @param {object} message - LoraWan full message.
   * @param {object} clientInfo - Client config.
   */
  server.on('pushdata:rxpk', async (message, clientInfo) => {
    parseServerMessage('pushdata:rxpk', message, clientInfo);
  });

  /**
   * @event module:loraWanServer~pullresp:txpk
   * @param {object} message - LoraWan full message.
   * @param {object} clientInfo - Client config.
   */
  server.on('pullresp:txpk', async (message, clientInfo) => {
    parseServerMessage('pullresp:txpk', message, clientInfo);
  });
};

/**
 * Parse internal application messages
 * @param {object} server - LoraWan Server instance
 * @param {object} message - Parsed UDP packet
 */
const parseAppMessage = async (server, message) => {
  // entry for parsed incoming mqtt messages
  try {
    if (!message || !message.direction || !message.gateway || !message.type) {
      return new Error('Error: Invalid message');
    }
    if (message.node && message.node.packet) {
      const node = message.node;
      const mType = node.packet.getMType().toString('hex');

      if (node.appKey) {
        let appKey;

        if (typeof node.appKey === 'object' && node.appKey instanceof Buffer) {
          appKey = node.appKey.toString('hex');
        } else {
          appKey = node.appKey;
        }
        if (mType && mType.toLowerCase() === 'join request') {
          // add netID to the payload ( put it device-manager lorawan app config )
          const keys = await loraWanHandler.resolveJoinRequest(
            node.packet,
            appKey,
          );
          if (!keys.nwkSKey || !keys.appSKey) {
            return 'Invalid keys';
          }

          const devEui = node.packet.getBuffers().DevEUI.toString('hex');
          node.appSKey = keys.appSKey.toString('hex');
          node.nwkSKey = keys.nwkSKey.toString('hex');
          node.appKey = appKey;
          nodes[devEui] = {...nodes[devEui], ...node};

          const txpk = await loraWanHandler.buildPacket({
            devAddr: utils.getRandomBytes(6).toString(),
            devEui,
            appEui: nodes[devEui].appEui,
            mType: 'Join Accept',
            ...networkOptions,
            ...keys,
            appKey,
            //  payload
          });
          // todo find the closest gateway ?
          return server.pullResp(
            txpk,
            {
              h: Math.floor(Math.random() * 300),
              l: Math.floor(Math.random() * 300),
            },
            {
              address: message.gateway.address,
              port: message.gateway.portdown,
            },
            message.gateway.id,
          );
        }
      } else if (node.nwkSKey && node.appSKey) {
        // todo switch based on messaging protocol used
        // retrieve info from a property ?
        // or dynamically from the payload structure ?
        // if ( node.protocolName = "cayenneLPP") {
        // }
        const {
          decodedPacket,
          cayennePayload,
        } = await loraWanHandler.parseCayennePayload(
          Buffer.from(node.packet, 'hex'),
          node.appSKey,
          node.nwkSKey,
        );

        const devAddr = decodedPacket.getBuffers().DevAddr.toString('hex');
        node.protocolName = 'cayenneLPP';
        node.packet = decodedPacket.getPHYPayload().toString('hex');
        node.lastPush = decodedPacket.getPHYPayload().toString('hex');
        node.cayennePayload = cayennePayload;
        nodes[devAddr] = {...nodes[devAddr], ...node};
        logger.publish(4, 'Lora-Server', 'onMessage:res :', nodes[devAddr]);
        await loraWanApp.emit(message.direction, {
          gateway: message.gateway,
          type: mType,
          direction: message.direction,
          node: nodes[devAddr],
        });

        return cayennePayload.forEach(async sensor => {
          if (sensor && sensor.nativeSensorId && sensor.type) {
            const key = `sensor-${sensor.type}-${sensor.nativeSensorId}`;
            if (!Object.prototype.hasOwnProperty.call(nodes[devAddr], key)) {
              nodes[devAddr][key] = sensor;
              return loraWanApp.emit(message.direction, {
                gateway: message.gateway,
                type: mType,
                direction: message.direction,
                sensor: nodes[devAddr][key],
              });
            }
            nodes[devAddr][key] = {
              // cayennePayload,
              ...nodes[devAddr][key],
              ...sensor,
            };
            return loraWanApp.emit(message.direction, {
              gateway: message.gateway,
              type: mType,
              direction: message.direction,
              sensor: nodes[devAddr][key],
            });
          }
          return null;
        });
      }
      return new Error('Error: device not authenticated');
    } else if (
      message.sensor &&
      message.sensor.packet &&
      message.sensor.nativeSensorId
    ) {
      const sensor = message.sensor;
      const devAddr = sensor.packet.getBuffers().DevAddr.toString('hex');
      //  const devEui = sensor.packet.getBuffers().DevEUI.toString('hex');
      // fromWire(sensor.packet)

      const key = `sensor-${sensor.type}-${sensor.nativeSensorId}`;
      if (!Object.prototype.hasOwnProperty.call(nodes[devAddr], key)) {
        return new Error("Error: sensor doesn't exist");
      }
      if (!nodes[devAddr].appSKey || !nodes[devAddr].nwkSKey) {
        return new Error('Error: device not authenticated');
      }

      // todo switch based on messaging protocol used
      // retrieve info from a property ?
      // or dynamically from the payload structure ?
      // if (sensor.protocolName === "cayenneLPP") {
      // }
      nodes[devAddr][key] = {
        ...nodes[devAddr][key],
        ...sensor,
      };
      const payload = await loraWanHandler.buildCayennePayload(sensor);
      //  console.log('built payload', payload);

      //  sensor.cayennePayload = payload;
      const txpk = await loraWanHandler.buildPacket({
        devAddr,
        payload,
        mType: 'Unconfirmed Data Down',
        ...networkOptions,
        nwkSKey: nodes[devAddr].nwkSKey,
        appSKey: nodes[devAddr].appSKey,
      });
      return server.pullResp(
        txpk,
        {
          h: Math.floor(Math.random() * 300),
          l: Math.floor(Math.random() * 300),
        },
        {
          address: message.gateway.address,
          port: message.gateway.portdown,
        },
        message.gateway.id,
      );
    }
    return new Error('Error: Invalid message');
  } catch (error) {
    return error;
  }
};

/**
 * Listen to Application internal events
 * @param {object} server - LoraWan Server instance
 */
const setAppListeners = server => {
  /**
   * Event reporting that LoraWanApp has received MQTT packet.
   * @event module:loraWanApp~message
   * @param {object} message - MQTT packet.
   */
  loraWanApp.on('message', async message => parseAppMessage(server, message));
  /**
   * Event reporting that loraWanApp has to close.
   * @event module:loraWanApp~close
   */
  loraWanApp.on('close', () => {
    if (server) {
      server.stop();
    }
  });
};

/**
 * Init LoraWan App
 * @param {object} config - Env variables
 */
const init = config => {
  logger.publish(3, 'Lora-Server', 'init', config.lorawan);
  /**
   * LoraWan Server.
   * @module loraWanServer
   */
  const loraWanServer = new LoraWanServer(config.lorawan);
  loraWanServer.start();
  setServerListeners(loraWanServer);
  setAppListeners(loraWanServer);
};

/**
 * Event reporting that appConfig has to init.
 * @event module:loraWanApp~init
 * @param {object} config - Formatted config.
 */
loraWanApp.on('init', config => {
  init(config);
});
