import EventEmitter from 'events';
import LoraWanServer from './lorawan-server';
import {loraWanHandler} from './lorawan-handler';
import logger from './logger';

/**
 * loraWan Application
 * @module loraWanApp
 */
export const loraWanApp = new EventEmitter();

/**
 * In memory nodes / sensors collection caching
 * @namespace
 * @property {object} gateways - Lorawan Gateways state
 * @property {object} nodes - Lorawan Devices state
 */
const state = {gateways: {}, nodes: {}};

/**
 * LoraWan network configuration
 * TODO : attribute this dynamically from app config ?
 * @namespace
 * @property {bool} imme - Sending payload immediatly ?
 * @property {float} freq - Lorawan Gateway frequencies
 * @property {int} rfch - Lorawan frequencies range
 * @property {int} powe - Gateway antenna amplification
 * @property {string} datr - Lora modulation
 * @property {string} codr - Lora modulation
 * @property {bool} ncrc - Deactivate CRC payload validation
 * @property {bool} ipol - Inverse polarity
 */
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
 * Update Storage collections
 * @param {string} model - Collection to update
 * @param {object} content - New collection content
 * @param {string} [key] - Instance/property to read
 * @fires module:loraWanApp~update
 */
const updateStore = (model, content, key) =>
  loraWanApp.emit('update', model, content, key);

/**
 * Find a Storage collection
 * @param {string} model - Collection to read
 * @param {string} [key] - Instance/property to read
 * @fires module:loraWanApp~find
 */
const getFromStore = (model, key) => loraWanApp.emit('find', model, key);

/**
 * Parse received packet from LoraWan Gateways
 * @param {object} message - Parsed JSON received from LoraWAN Server
 * @fires module:loraWanApp~RX
 * @throws Will throw an error if the message.data is null.
 */
const handleRXLoraPacket = async message => {
  try {
    const pdata = message.data.rxpk[0].data;
    const packet = await loraWanHandler.decodePacket(pdata);
    logger.publish(
      4,
      'Lora-Server',
      'handleRXLoraPacket:req',
      `${message.type} ${message.direction} ${packet
        .getMType()
        .toString('hex')}`,
    );
    if (packet.getBuffers().PHYPayload) {
      if (packet.getBuffers().DevEUI && packet.getBuffers().DevNonce) {
        const devEui = packet.getBuffers().DevEUI.toString('hex');
        if (!Object.prototype.hasOwnProperty.call(state.nodes, devEui)) {
          state.nodes[devEui] = {
            auth: 'OTAA',
            transportProtocol: 'loraWan',
            protocolVersion: '1',
            messageProtocol: '',
            gwId: message.gateway,
            devEui,
          };
        }
        state.nodes[devEui].joinEui = packet
          .getBuffers()
          .AppEUI.toString('hex');
        state.nodes[devEui].packet = pdata;
        state.nodes[devEui].MIC = packet.getBuffers().MIC.toString('hex');
        state.nodes[devEui].lastPush = packet.getPHYPayload().toString('hex');
        state.nodes[devEui].lastSignal = new Date();
        state.nodes[devEui].frameCounter = packet.getFCnt();
        logger.publish(4, 'Lora-Server', 'node', state.nodes[devEui]);
        await updateStore('nodes', state.nodes[devEui], devEui);
        return loraWanApp.emit('RX', {
          gateway: state.gateways[message.gateway],
          type: message.type,
          direction: message.direction,
          node: state.nodes[devEui],
        });
      } else if (packet.getBuffers().DevAddr) {
        const devAddr = packet.getBuffers().DevAddr.toString('hex');
        if (!Object.prototype.hasOwnProperty.call(state.nodes, devAddr)) {
          state.nodes[devAddr] = {
            auth: 'ABP',
            transportProtocol: 'loraWan',
            protocolVersion: '1',
            messageProtocol: '',
            gwId: message.gateway,
            devAddr,
          };
        }
        state.nodes[devAddr].packet = pdata;
        state.nodes[devAddr].MIC = packet.getBuffers().MIC.toString('hex');
        state.nodes[devAddr].lastPush = packet.getPHYPayload().toString('hex');
        state.nodes[devAddr].lastSignal = new Date();
        state.nodes[devAddr].frameCounter = packet.getFCnt();
        await updateStore('nodes', state.nodes[devAddr], devAddr);
        return loraWanApp.emit('RX', {
          gateway: state.gateways[message.gateway],
          type: message.type,
          direction: message.direction,
          node: state.nodes[devAddr],
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
const handleTXLoraPacket = async message => {
  try {
    const pdata = message.txpk.data;
    const packet = await loraWanHandler.decodePacket(pdata);
    logger.publish(
      4,
      'Lora-Server',
      'handleTXLoraPacket:req',
      `${message.type} ${message.direction} ${packet
        .getMType()
        .toString('hex')}`,
    );
    // if payload's correct send it to mqtt client
    if (packet.getBuffers().PHYPayload && packet.getBuffers().DevEUI) {
      const devEui = packet.getBuffers().DevEUI.toString('hex');
      if (!Object.prototype.hasOwnProperty.call(state.nodes, devEui)) {
        return null;
      }
      state.nodes[devEui].packet = pdata;
      state.nodes[devEui].MIC = packet.getBuffers().MIC.toString('hex');
      state.nodes[devEui].lastPull = packet.getPHYPayload().toString('hex');
      state.nodes[devEui].lastSignal = new Date();
      state.nodes[devEui].frameCounter = packet.getFCnt();
      await updateStore('nodes', state.nodes[devEui], devEui);

      return loraWanApp.emit('TX', {
        gateway: state.gateways[message.gateway],
        type: message.type,
        direction: message.direction,
        node: state.nodes[devEui],
      });
    } else if (packet.getBuffers().DevAddr) {
      const devAddr = packet.getBuffers().DevAddr.toString('hex');
      if (!Object.prototype.hasOwnProperty.call(state.nodes, devAddr)) {
        return null;
      }
      state.nodes[devAddr].MIC = packet.getBuffers().MIC.toString('hex');
      state.nodes[devAddr].packet = pdata;
      state.nodes[devAddr].lastPull = packet.getPHYPayload().toString('hex');
      state.nodes[devAddr].lastSignal = new Date();
      state.nodes[devAddr].frameCounter = packet.getFCnt();
      await updateStore('nodes', state.nodes[devAddr], devAddr);
      return loraWanApp.emit('TX', {
        gateway: state.gateways[message.gateway],
        type: message.type,
        direction: message.direction,
        node: state.nodes[devAddr],
      });
    }
    return null;
  } catch (error) {
    return error;
  }
};

/**
 * Parse message coming from LoraWan Gateways
 * @param {string} type - Message type.
 * @param {object} message - Parsed UDP packet
 * @param {object} clientInfo - Gateway infos
 */
const parseServerMessage = async (type, message, clientInfo) => {
  try {
    if (
      type &&
      clientInfo &&
      clientInfo.port &&
      clientInfo.address &&
      message &&
      message.gateway
    ) {
      logger.publish(4, 'Lora-Server', 'parseServerMessage:req', {type});

      if (
        !Object.prototype.hasOwnProperty.call(state.gateways, message.gateway)
      ) {
        await getFromStore('gateways', message.gateway);
        state.gateways[message.gateway] = {
          mac: message.gateway,
          transportProtocol: 'loraWan',
          protocolVersion: message.protocol,
        };
      }
      switch (type) {
        case 'pushack':
          state.gateways[message.gateway].portup = clientInfo.port;
          state.gateways[message.gateway].address = clientInfo.address;
          state.gateways[message.gateway].latitude = '';
          state.gateways[message.gateway].longitude = '';
          logger.publish(4, 'Lora-Server', 'pushack:res', {
            address: state.gateways[message.gateway].address,
            port: state.gateways[message.gateway].portup,
          });
          await updateStore(
            'gateways',
            state.gateways[message.gateway],
            message.gateway,
          );
          break;
        case 'pullack':
          state.gateways[message.gateway].portdown = clientInfo.port;
          state.gateways[message.gateway].address = clientInfo.address;
          state.gateways[message.gateway].latitude = '';
          state.gateways[message.gateway].longitude = '';
          logger.publish(4, 'Lora-Server', 'pullack:res', {
            address: state.gateways[message.gateway].address,
            port: state.gateways[message.gateway].portdown,
          });
          await updateStore(
            'gateways',
            state.gateways[message.gateway],
            message.gateway,
          );
          break;
        case 'txack':
          if (
            Object.prototype.hasOwnProperty.call(
              state.gateways,
              message.gateway,
            )
          ) {
            await loraWanApp.emit('status', {
              gateway: state.gateways[message.gateway],
              type: message.type,
              direction: message.direction,
              payload: message.data,
            });
            logger.publish(4, 'Lora-Server', 'txack:res', {
              address: state.gateways[message.gateway].address,
              port: state.gateways[message.gateway].portdown,
              error: message.data,
            });
          }
          break;
        case 'pushdata:rxpk':
          await handleRXLoraPacket(message);
          break;
        case 'pullresp:txpk':
          await handleTXLoraPacket(message);
          break;
        default:
          return null;
      }
      return null;
    }
    return new Error('Invalid message');
  } catch (error) {
    return error;
  }
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
    logger.publish(4, 'Lora-Server', 'status', {client, info});
  });

  /**
   * @event module:loraWanServer~close
   * @param {object} client - Client config.
   * @param {object} info - Connection details.
   * @fires module:loraWanApp~status
   */
  server.on('close', (client, info) => {
    logger.publish(4, 'Lora-Server', 'status', {client, info});
  });

  /**
   * @event module:loraWanServer~pushdata:status
   * @param {object} message - LoraWan full message.
   * @param {object} clientInfo - Client config.
   * @fires module:loraWanApp~status
   */
  server.on('pushdata:status', (message, clientInfo) => {
    logger.publish(5, 'Lora-Server', 'status', {message, clientInfo});
    if (Object.prototype.hasOwnProperty.call(state.gateways, message.gateway)) {
      loraWanApp.emit('status', {
        gateway: state.gateways[message.gateway],
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
   * @returns {function} parseServerMessage
   */
  server.on('pushack', async (message, clientInfo) =>
    parseServerMessage('pushack', message, clientInfo),
  );

  /**
   * @event module:loraWanServer~pullack
   * @param {object} message - LoraWan full message.
   * @param {object} clientInfo - Client config.
   * @returns {function} parseServerMessage
   */
  server.on('pullack', async (message, clientInfo) =>
    parseServerMessage('pullack', message, clientInfo),
  );

  /**
   * @event module:loraWanServer~txack
   * @param {object} message - LoraWan full message.
   * @param {object} clientInfo - Client config.
   * @returns {function} parseServerMessage
   */
  server.on('txack', async (message, clientInfo) =>
    parseServerMessage('txack', message, clientInfo),
  );

  /**
   * @event module:loraWanServer~pushdata:rxpk
   * @param {object} message - LoraWan full message.
   * @param {object} clientInfo - Client config.
   * @returns {function} parseServerMessage
   */
  server.on('pushdata:rxpk', async (message, clientInfo) =>
    parseServerMessage('pushdata:rxpk', message, clientInfo),
  );

  /**
   * @event module:loraWanServer~pullresp:txpk
   * @param {object} message - LoraWan full message.
   * @param {object} clientInfo - Client config.
   * @returns {function} parseServerMessage
   */
  server.on('pullresp:txpk', async (message, clientInfo) =>
    parseServerMessage('pullresp:txpk', message, clientInfo),
  );
};

/**
 * Answer to valid join request
 * @param {object} server - LoraWAN Server
 * @param {object} message - LoraWan Application message
 * @param {string} appKey - Device AppKey
 * @param {object} packet - LoraWan Application packet
 * @returns {function} LoraWANServer.pullResp
 */
const sendJoinAccept = async (server, message, packet) => {
  // add netID to the payload ( put it device-manager lorawan app config )
  try {
    if (!message.gateway) return new Error('Error : no registered gateway');
    const result = await loraWanHandler.buildJoinAccept(
      message,
      packet,
      networkOptions,
    );
    if (!result.keys || !result.txpk) {
      return new Error('Error: No TX packet to send');
    }
    // todo save keys on join accept success
    // state.nodes[message.node.devEui].appSKey = result.keys.appSKey;
    // state.nodes[message.node.devEui].nwkSKey = result.keys.nwkSKey;

    // todo find the closest gateway ?
    return server.pullResp(
      result.txpk,
      {
        h: Math.floor(Math.random() * 300),
        l: Math.floor(Math.random() * 300),
      },
      {
        address: message.gateway.address,
        port: message.gateway.portdown,
      },
      message.gateway.mac,
    );
  } catch (error) {
    logger.publish(2, 'Lora-Server', 'sendJoinAccept:err', error);
    return error;
  }
};

/**
 * Update device with decoded results
 * @param {object} node - Found device instance
 * @returns {object} node - Updated node
 */
const updateDevice = async (node, decodedPacket) => {
  try {
    logger.publish(4, 'Lora-Server', 'updateDevice:req', {node});
    node.decoded = decodedPacket;
    //  node.cayennePayload = decoded.cayennePayload;
    logger.publish(4, 'Lora-Server', 'updateDevice:res', node);
    return node;
  } catch (error) {
    logger.publish(2, 'Lora-Server', 'updateDevice:err', error);
    return error;
  }
};

/**
 * Update state and publish to Aloes backend
 * @param {array} sensors - Found device sensors
 * @param {object} message - LoraWan App payload
 * @returns {array} sensors - Formatted sensors
 */
const publishSensorUpdates = async (sensors, message) => {
  try {
    const nodeId = message.node.devEui || message.node.devAddr;
    sensors = await sensors.forEach(sensor => {
      const keys = Object.keys(sensor);
      state.nodes[nodeId][keys[0]] = sensor[keys[0]];
      logger.publish(
        4,
        'Lora-Server',
        'publishSensorUpdates:res',
        sensor[keys[0]],
      );
      loraWanApp.emit('TX', {
        gateway: message.gateway,
        type: message.type,
        direction: message.direction,
        sensor: sensor[keys[0]],
      });
      return sensor[keys[0]];
    });
    return Promise.all(sensors);
  } catch (error) {
    logger.publish(2, 'Lora-Server', 'publishSensorUpdates:err', error);
    return error;
  }
};

/**
 * Dispatch incoming Lora packet
 * @param {object} message - LoraWan App payload
 * @fires module:loraWanApp~RX
 */
const handleRXAppMessage = async (server, message) => {
  try {
    logger.publish(4, 'Lora-Server', 'handleRXAppMessage:req', {
      message,
    });
    const node = message.node;
    const packet = await loraWanHandler.decodePacket(node.packet);
    const mType = packet.getMType().toString('hex');

    if (node.appKey && (!node.nwkSKey || !node.appSKey)) {
      if (typeof node.appKey === 'object' && node.appKey instanceof Buffer) {
        message.node.appKey = node.appKey.toString('hex');
      }
      if (mType && mType.toLowerCase() === 'join request') {
        // add netID to the payload ( put it device-manager lorawan app config )
        return sendJoinAccept(server, message, packet);
      }
      return null;
    }
    if (
      node.messageProtocol &&
      node.messageProtocol.toLowerCase() === 'cayennelpp'
    ) {
      const protocol = {packet, method: mType, devAddr: node.devAddr};
      const result = await loraWanHandler.parseCayennePayload(
        packet,
        node.appSKey,
        node.nwkSKey,
        protocol,
      );
      if (!result || !result.decodedPacket || !result.cayennePayload) {
        return new Error('Error: while decoding lorapacket');
      }
      const devAddr = packet.getBuffers().DevAddr.toString('hex');
      state.nodes[devAddr] = await updateDevice(node, result.decodedPacket);
      let sensors = await loraWanHandler.updateCayenneSensors(
        node,
        result.cayennePayload,
      );
      if (!sensors || sensors === null) return null;
      sensors = await publishSensorUpdates(sensors, message);

      console.log('sensors', sensors);

      await updateStore('nodes', state.nodes[devAddr], devAddr);
      return null;
    }
    return new Error('Error: Protocol not supported');
  } catch (error) {
    return error;
  }
};

/**
 * Dispatch outgoing Lora packet
 * @param {object} server - LoraWan Server instance
 * @param {object} message - LoraWan App payload
 * @returns {function} LoraWANServer.pullResp
 */
const handleTXAppMessage = async (server, message) => {
  try {
    logger.publish(4, 'Lora-Server', 'handleTXAppMessage:req', {message});

    if (message.sensor) {
      const sensor = message.sensor;
      const devAddr = sensor.packet.getBuffers().DevAddr.toString('hex');
      const devEui = sensor.packet.getBuffers().DevEUI.toString('hex');
      const key = `sensor-${sensor.type}-${sensor.nativeSensorId}`;
      if (!Object.prototype.hasOwnProperty.call(state.nodes[devAddr], key)) {
        return new Error("Error: sensor doesn't exist");
      }
      if (!state.nodes[devAddr].appSKey || !state.nodes[devAddr].nwkSKey) {
        return new Error('Error: device not authenticated');
      }
      if (devEui && devEui !== null) {
        state.nodes[devEui][key] = {
          ...state.nodes[devEui][key],
          ...sensor,
        };
      } else {
        state.nodes[devAddr][key] = {
          ...state.nodes[devAddr][key],
          ...sensor,
        };
      }
    }

    if (
      sensor.messageProtocol &&
      sensor.messageProtocol.toLowerCase() === 'cayennelpp'
    ) {
      const payload = await loraWanHandler.buildCayennePayload(sensor);
      //  console.log('built payload', payload);

      const txpk = await loraWanHandler.buildPacket({
        devAddr,
        payload,
        mType: 'Unconfirmed Data Down',
        ...networkOptions,
        nwkSKey: state.nodes[devAddr].nwkSKey,
        appSKey: state.nodes[devAddr].appSKey,
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
        message.gateway.mac,
      );
    }
    return new Error('Error: Protocol not supported');
  } catch (error) {
    return error;
  }
};
/**
 * Parse internal application messages
 * @param {object} server - LoraWan Server instance
 * @param {object} message - Parsed Application packet
 */
const parseAppMessage = async (server, message) => {
  // entry for parsed incoming mqtt messages
  try {
    logger.publish(4, 'lora-server', 'parseAppMessage:req', message);

    if (!message || !message.direction || !message.gateway || !message.type) {
      return new Error('Error: Invalid message');
    }
    if (message.node && message.node.packet) {
      if (
        message.node.appKey ||
        (message.node.nwkSKey && message.node.appSKey)
      ) {
        // if node authenticated
        return handleRXAppMessage(server, message);
      }
      return new Error('Error: device not authenticated');
    } else if (
      message.sensor &&
      message.sensor.packet &&
      message.sensor.nativeSensorId
    ) {
      // we consider device is already authenticated at this point
      return handleTXAppMessage(server, message);
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
   * @returns {function} parseAppMessage
   */
  loraWanApp.on('message', async message => parseAppMessage(server, message));

  loraWanApp.on('found', async (model, content, key) => {
    logger.publish(4, 'Lora-Server', 'found:res', {model, key});
    if (!content || !state[model]) return null;
    if (key) {
      state[model][key] = content;
    } else {
      state[model] = content;
    }
    return null;
  });

  loraWanApp.on('updated', async (model, content) => {
    logger.publish(5, 'Lora-Server', 'updated:res', {model, content});
    return null;
  });
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
 * @param {object} conf - Env variables
 * @param {number} conf.lorawan.portup - LoraWAN server UDP portup.
 * @param {number} conf.lorawan.portdown - LoraWAN server UDP portdown.
 * @param {number} conf.lorawan.port - LoraWAN server UDP port.
 * @param {string} conf.lorawan.address - LoraWAN server UDP host.
 * @param {object} conf.gateways - Initial gateways state value
 * @param {object} conf.nodes - Initial nodes state value
 * @returns {object} loraWanServer
 */
const init = async conf => {
  try {
    logger.publish(3, 'Lora-Server', 'init:req', conf.lorawan);
    state.gateways = conf.gateways || {};
    state.nodes = conf.nodes || {};

    /**
     * LoraWan Server.
     * @module loraWanServer
     */
    const loraWanServer = new LoraWanServer(conf.lorawan);
    loraWanServer.start();
    setServerListeners(loraWanServer);
    setAppListeners(loraWanServer);
    return loraWanServer;
  } catch (error) {
    logger.publish(3, 'Lora-Server', 'init:err', error);
    return error;
  }
};

/**
 * Event reporting that loraWanApp has to init.
 * @event module:loraWanApp~init
 * @param {object} conf - Formatted config.
 */
loraWanApp.on('init', async conf => {
  const server = await init(conf);
  return loraWanApp.emit('done', server);
});
