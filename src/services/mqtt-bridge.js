/* eslint-disable no-underscore-dangle */
import mqtt from 'async-mqtt';
import mqttPattern from 'mqtt-pattern';
import EventEmitter from 'events';
import protocolRef from './common';
import logger from './logger';

/**
 * LoraWan Proxy
 * @module mqttBridge
 */
export const mqttBridge = new EventEmitter();

/**
 * @method
 * @param {object} message - Formatted message
 * @fires module:mqttBridge~message
 */
const send = message => {
  /**
   * Event reporting that MQTT Client received a message.
   * @event module:mqttBridge~message
   * @property {object} message - Message content.
   */
  mqttBridge.emit('message', message);
};

/**
 * Parse message coming from MQTT broker
 * @param {string} topic - MQTT Topic
 * @param {object} message - raw packet.payload
 */
const parseBrokerMessage = (topic, message) => {
  try {
    logger.publish(4, 'mqtt-bridge', 'parseBrokerMessage:res', {
      topic,
    });
    let aloesClientRoute = null;
    if (mqttPattern.matches(protocolRef.externalCollectionPattern, topic)) {
      aloesClientRoute = mqttPattern.exec(
        protocolRef.externalCollectionPattern,
        topic,
      );
    } else if (
      mqttPattern.matches(protocolRef.externalInstancePattern, topic)
    ) {
      aloesClientRoute = mqttPattern.exec(
        protocolRef.externalInstancePattern,
        topic,
      );
    }
    if (!aloesClientRoute || aloesClientRoute === null) {
      return new Error('Error: Invalid pattern');
    }
    logger.publish(
      4,
      'mqtt-bridge',
      'parseBrokerMessage:res',
      aloesClientRoute,
    );
    if (aloesClientRoute.appEui !== mqttBridge.username) {
      return new Error('Error: Invalid app Id');
    }
    const methodExists = protocolRef.validators.methods.some(
      meth => meth === aloesClientRoute.method,
    );
    const collectionNameExists = protocolRef.validators.collectionNames.some(
      name => name === aloesClientRoute.collectionName,
    );
    logger.publish(4, 'mqtt-bridge', 'parseBrokerMessage:res', {
      methodExists,
      collectionNameExists,
    });
    if (methodExists && collectionNameExists) {
      message = JSON.parse(message);

      if (message.gateway && message.direction && message.type) {
        // switch (aloesClientRoute.collectionName.toLowerCase()) {
        //   case 'application':
        //     message = {...message};
        //     break;
        //   case 'device':
        //     message = {...message};
        //     break;
        //   case 'sensor':
        //     if (!message.sensor) {
        //       return new Error('Error: No sensor instance');
        //     }
        //     message = {...message};
        //     break;
        //   default:
        //     return new Error('Error: Comment est-ce possible?');
        // }
        // read packet.mType ?

        return send(message);
      }
      return new Error('Error: Invalid message');
    }
    return new Error('Error: Invalid pattern');
  } catch (error) {
    return error;
  }
};

/**
 * Listen to MQTT Client events
 * @param {object} client - MQTT client instance
 */
const setBrokerListeners = client => {
  /**
   * @event module:mqttClient~error
   * @param {object} error - Connection error
   * @fires module:mqttBridge~error
   */
  client.on('error', err => {
    mqttBridge.emit('error', err);
  });

  /**
   * @event module:mqttClient~connect
   * @param {object} state - Connection status
   * @fires module:mqttBridge~status
   */
  client.on('connect', async state => {
    mqttBridge.emit('status', state);
    mqttBridge.username = client._client.options.username;
    mqttBridge.connected = true;
    if (mqttBridge.username) {
      await client.subscribe(`${mqttBridge.username}/IoTAgent/#`);
    }
    return mqttBridge;
  });

  /**
   * @event module:mqttClient~disconnect
   * @param {object} state - Connection status
   * @fires module:mqttBridge~status
   */
  client.on('disconnect', state => {
    delete mqttBridge.username;
    mqttBridge.connected = false;
    mqttBridge.emit('status', state);
  });

  /**
   * @event module:mqttClient~message
   * @param {object} topic - MQTT Topic
   * @param {object} message - MQTT Payload
   * @returns {function} parseBrokerMessage
   */
  client.on('message', async (topic, message) =>
    parseBrokerMessage(topic, message),
  );
};

/**
 * Parse internal application messages coming from LoraWan-Controller
 * @param {object} client - MQTT client instance
 * @param {object} message - Raw MQTT payload
 */
const parseAppMessage = async (client, message) => {
  try {
    if (!client || !mqttBridge.connected || !mqttBridge.username) {
      return new Error('Error: Invalid mqtt client');
    }
    if (!message || !message.gateway || !message.direction || !message.type) {
      return new Error('Error: invalid message');
    }
    let payload;
    let patternName = protocolRef.externalPattern;
    const params = {
      appEui: mqttBridge.username,
      gatewayId: message.gateway.mac,
      collectionName: null,
      method: null,
    };

    if (message.payload) {
      logger.publish(4, 'mqtt-bridge', 'publish:req', {
        payload: message.payload,
      });
      params.collectionName = 'Device';
      if (message.gateway.id) {
        params.method = 'PUT';
        params.modelId = message.gateway.id;
        patternName = protocolRef.externalInstancePattern;
      } else {
        params.method = 'POST';
        patternName = protocolRef.externalCollectionPattern;
      }
      payload = JSON.stringify({
        gateway: message.gateway,
        packet: message.payload,
        direction: message.direction,
        type: message.type,
      });
    } else if (message.node) {
      logger.publish(4, 'mqtt-bridge', 'publish:req', {node: message.node});
      const node = message.node;
      params.collectionName = 'Device';
      if (node.auth === 'ABP') {
        if (!node.appSKey || !node.nwkSKey) {
          params.method = 'HEAD';
        } else if (node.id) {
          params.method = 'PUT';
          params.modelId = node.id;
          patternName = protocolRef.externalInstancePattern;
        } else {
          params.method = 'POST';
          patternName = protocolRef.externalCollectionPattern;
          patternName = protocolRef.externalCollectionPattern;
        }
        payload = JSON.stringify({
          gateway: message.gateway,
          node,
          direction: message.direction,
          type: message.type,
        });
      } else if (node.auth === 'OTAA') {
        if (!node.appKey || !node.appSKey || !node.nwkSKey) {
          params.method = 'HEAD';
        } else if (node.id) {
          params.method = 'PUT';
          params.modelId = node.id;
          patternName = protocolRef.externalInstancePattern;
        } else {
          params.method = 'POST';
          patternName = protocolRef.externalCollectionPattern;
        }
        payload = JSON.stringify({
          gateway: message.gateway,
          node,
          direction: message.direction,
          type: message.type,
        });
      }
    } else if (message.sensor) {
      logger.publish(4, 'mqtt-bridge', 'publish:req', {sensor: message.sensor});
      params.collectionName = 'Sensor';
      if (message.sensor.id) {
        params.modelId = message.sensor.id;
        params.method = 'PUT';
        patternName = protocolRef.externalInstancePattern;
      } else {
        params.method = 'POST';
        patternName = protocolRef.externalCollectionPattern;
      }
      payload = JSON.stringify({
        gateway: message.gateway,
        sensor: message.sensor,
        direction: message.direction,
        type: message.type,
      });
    }
    if (params.collectionName === null || params.method === null || !payload) {
      return new Error('Error: invalid message');
    }
    //  const topic = mqttPattern.fill(protocolRef.externalPattern, params);
    const topic = mqttPattern.fill(patternName, params);
    logger.publish(4, 'mqtt-bridge', 'publish:res', {topic});
    await client.publish(topic, payload, {qos: 0});
    return {topic, payload};
  } catch (error) {
    logger.publish(4, 'mqtt-bridge', 'publish:err', error);
    return error;
  }
};

/**
 * Listen to Application internal events
 * @param {object} server - LoraWan Server instance
 */
const setAppListeners = client => {
  /**
   * Event reporting that mqttBridge has to proxy a message.
   * @event module:mqttBridge~publish
   * @param {object} message - LoraWan message.
   * @returns {function} parseAppMessage
   */
  mqttBridge.on('publish', async message => parseAppMessage(client, message));

  /**
   * Event reporting that mqttBridge has to close.
   * @event module:mqttBridge~close
   */
  mqttBridge.on('close', () => {
    if (client) {
      client.end();
    }
  });
};

/**
 * Init MQTT Bridge
 * @param {object} config - Formatted configuration variables
 * @param {string} config.brokerUrl - Remote MQTT broker
 * @param {string} config.mqtt.clientId - Unique client Id
 * @param {string} config.mqtt.username - Application Id
 * @param {object} config.mqtt.password - Password, aka API key
 * @returns {object} mqttClient
 */
const init = async config => {
  try {
    logger.publish(3, 'mqtt-bridge', 'init:req', config.mqtt);
    /**
     * MQTT.JS Client.
     * @module mqttClient
     */
    const mqttClient = mqtt.connect(config.brokerUrl, config.mqtt);
    setBrokerListeners(mqttClient);
    setAppListeners(mqttClient);
    return mqttClient;
  } catch (error) {
    logger.publish(3, 'mqtt-bridge', 'init:err', error);
    return error;
  }
};

/**
 * Event reporting that mqttBridge has to init.
 * @event module:mqttBridge~init
 * @param {object} config - Formatted config.
 */
mqttBridge.on('init', async config => {
  const client = await init(config);
  return mqttBridge.emit('done', client);
});
