import dotenv from 'dotenv';
import {appConfig} from './config';
import {loraWanApp} from './services/lorawan-controller';
import {mqttBridge} from './services/mqtt-bridge';
import {cacheStore} from './services/cache-store';
import {fileStore} from './services/file-store';
import {defaultGateways} from './store/gateways';
import {defaultNodes} from './store/nodes';
import logger from './services/logger';

/**
 * Parsed environment variables
 * @namespace
 */
const result = dotenv.config();
if (result.error) {
  throw result.error;
}

let storage = null;

/**
 * In memory nodes / sensors collection caching
 * @namespace
 * @property {object} gateways - Lorawan Gateways state
 * @property {object} nodes - Lorawan Devices state
 */
const state = {gateways: {}, nodes: {}};

/**
 * @module LoraWanTransport
 */

const dispatchRXDevAddr = message => {
  const node = message.node;
  if (node.appSKey && node.devAddr) {
    return loraWanApp.emit('message', message);
  }
  // if (!node.appSKey && node.devAddr && node.devAddr === '03ff0001') {
  //   message.node.nwkSKey = Buffer.from(
  //     '2B7E151628AED2A6ABF7158809CF4F3C',
  //     'hex',
  //   );
  //   message.node.appSKey = Buffer.from(
  //     '2B7E151628AED2A6ABF7158809CF4F3C',
  //     'hex',
  //   );
  //   return loraWanApp.emit('message', message);
  // }
  return null;
};

const dispatchRXDevEui = message => {
  const node = message.node;
  if (node.appKey && node.devEui) {
    return loraWanApp.emit('message', message);
  }
  // if (
  //   node.devEui &&
  //   node.devEui === '0004a30b001fbb91' &&
  //   !node.appKey &&
  //   node.packet.getMType().toLowerCase() === 'join request'
  // ) {
  //   //  console.log(node.packet.toString('hex'));
  //   message.node.appKey = Buffer.from(
  //     'B6B53F4A168A7A88BDF7EA135CE9CFCA',
  //     'hex',
  //   );
  //   return loraWanApp.emit('message', message);
  // }
  return null;
};

/**
 * @method
 */
const setLoraWanAppListeners = () => {
  /**
   * @event module:loraWanApp~status
   * @param {object} state - status content.
   * @fires module:mqttBridge~publish
   */
  loraWanApp.on('status', async message => {
    try {
      logger.publish(4, 'lora-server', 'status', message);
      return mqttBridge.emit('publish', message);
    } catch (error) {
      return error;
    }
  });

  /**
   * @event module:loraWanApp~error
   * @param {object} error - error content.
   */
  loraWanApp.on('error', (client, error) => {
    logger.publish(4, 'lora-server', 'error', {client, error});
  });

  /**
   * @event module:loraWanApp~TX
   * @param {object} message - message content.
   * @fires module:mqttBridge~publish
   */
  loraWanApp.on('TX', message => {
    //  logger.publish(4, 'lora-server', 'TX', message);
    mqttBridge.emit('publish', message);
  });

  /**
   * @event module:loraWanApp~RX
   * @param {object} message - message content.
   * @fires module:mqttBridge~publish
   */
  loraWanApp.on('RX', async message => {
    try {
      if (
        message.node &&
        message.node.nwkSKey &&
        message.node.appSKey &&
        message.node.devAddr
      ) {
        //   logger.publish(4, 'lora-server', 'RX', message.node.packet);
        return dispatchRXDevAddr(message);
      }
      if (message.node && message.node.appKey && message.node.devEui) {
        //   logger.publish(4, 'lora-server', 'RX', message.node.packet);
        return dispatchRXDevEui(message);
      }
      return mqttBridge.emit('publish', message);
    } catch (error) {
      return error;
    }
  });

  /**
   * @event module:loraWanApp~find
   * @param {object} model - model to update.
   * @param {string} [key] - Instance/property to read
   * @fires module:mqttBridge~publish
   */
  loraWanApp.on('find', async (model, key) => {
    //  logger.publish(4, 'lora-server', 'TX', message);
    if (storage === 'inFile') {
      const content = await fileStore.find(model);
      return loraWanApp.emit('found', model, content);
    } else if (storage === 'cacheStorage') {
      const cacheValue = await cacheStore.find(model, key);
      return loraWanApp.emit('found', model, cacheValue, key);
    } else if (state[model]) {
      let content;
      if (key) {
        content = state[model][key];
        return loraWanApp.emit('found', model, content, key);
      }
      content = state[model];
      return loraWanApp.emit('found', model, content);
    }
    return new Error('Error : No store selected');
  });

  /**
   * @event module:loraWanApp~update
   * @param {object} model - model to update.
   * @param {string} [key] - Instance/property to read
   * @fires module:loraWanApp~updated
   */
  loraWanApp.on('update', async (model, content, key) => {
    logger.publish(4, 'lora-server', 'update', content);
    if (storage === 'inFile') {
      const storedValue = await fileStore.update(model, content);
      return loraWanApp.emit('updated', model, storedValue);
    } else if (storage === 'cacheStorage') {
      const cacheValue = await cacheStore.update(model, content, key);
      return loraWanApp.emit('updated', model, cacheValue);
    } else if (state[model]) {
      state[model] = content;
      if (key) {
        state[model][key] = content;
        return loraWanApp.emit('updated', model, state[model][key], key);
      }
      state[model] = content;
      return loraWanApp.emit('updated', model, state[model]);
    }
    return new Error('Error : No store selected');
  });
};

/**
 * @method
 */
const setMqttBridgeListeners = () => {
  /**
   * @event module:mqttBridge~status
   * @param {object} state - status content.
   */
  mqttBridge.on('status', status => {
    logger.publish(4, 'mqtt-bridge', 'status', status);
  });

  /**
   * @event module:mqttBridge~error
   * @param {object} error - error content.
   */
  mqttBridge.on('error', error => {
    logger.publish(3, 'mqtt-bridge', 'onError', error);
  });

  /**
   * @event module:mqttBridge~message
   * @param {object} message - message content.
   * @fires module:loraWanApp~message
   */
  mqttBridge.on('message', async message => {
    try {
      logger.publish(3, 'mqtt-bridge', 'onMessage', message);
      if (message.gateway) {
        return loraWanApp.emit('message', message);
      }
      return null;
    } catch (error) {
      return error;
    }
  });
};

/**
 * Init services.
 * @method
 * @param {object} conf - Formatted configuration
 * @fires module:loraWanApp~init
 * @fires module:mqttBridge~init
 * @returns {object} conf
 */
const initServices = async conf => {
  try {
    logger.publish(3, 'Main', 'initServices:req', conf);

    storage = conf.storage;
    if (storage === 'cacheStorage') {
      /**
       * @module cacheStore
       */
      /**
       * @method module:cacheStore.init
       * @param {object} conf - Formatted configuration
       */
      await cacheStore.init(conf);
      conf.gateways = await cacheStore.find('gateways');
      conf.nodes = await cacheStore.find('nodes');
    } else if (storage === 'inFile') {
      /**
       * @module fileStore
       */
      /**
       * @method module:fileStore.init
       * @param {object} conf - Formatted configuration
       */
      await fileStore.init(conf);
      conf.gateways = await fileStore.find('gateways');
      conf.nodes = await fileStore.find('nodes');
    } else {
      conf.gateways = defaultGateways;
      conf.nodes = defaultNodes;
    }
    state.gateways = conf.gateways;
    state.nodes = conf.nodes;

    logger.publish(3, 'config', 'gateways', conf.gateways);
    logger.publish(3, 'config', 'nodes', conf.nodes);
    if (!conf.nodes || !conf.gateways) {
      return new Error('Error : no initial state');
    }

    /**
     * @module loraWanApp
     */
    /**
     * @event module:loraWanApp~done
     * @param {object} server - LoraWan server.
     * @returns {function} setLoraWanAppListeners
     */
    loraWanApp.on('done', server => {
      if (server) {
        return setLoraWanAppListeners();
      }
      return new Error('Error : LoraWAN server is not launched');
    });

    loraWanApp.emit('init', conf);

    /**
     * @module mqttBridge
     */
    /**
     * @event module:mqttBridge~done
     * @param {object} client - MQTT client.
     * @returns {function} setMqttBridgeListeners
     */
    mqttBridge.on('done', client => {
      if (client) {
        return setMqttBridgeListeners();
      }
      return new Error('Error : MQTT bridge is not launched');
    });
    mqttBridge.emit('init', conf);
    return conf;
  } catch (error) {
    logger.publish(3, 'Main', 'initServices:err', error);
    return error;
  }
};

/**
 * Init application.
 * @method
 * @param {object} envVariables - Environement variables.
 * @fires module:appConfig~init
 */
const initApp = envVariables => {
  /**
   * Event reporting that appConfig has done the job.
   * @event module:appConfig~done
   * @param {object} config - Formatted config
   * @returns {function} initServices
   */
  appConfig.on('done', async conf => {
    logger.publish(3, 'config', 'done', conf);
    return initServices(conf);
  });
  appConfig.emit('init', envVariables);
};

initApp(result.parsed);
