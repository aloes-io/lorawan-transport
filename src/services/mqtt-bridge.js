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
    let aloesClientRoute = null;
    if (mqttPattern.matches(protocolRef.externalPattern, topic)) {
      aloesClientRoute = mqttPattern.exec(protocolRef.externalPattern, topic);
      logger(4, 'mqtt-bridge', 'aloesClientRoute:res', aloesClientRoute);
    }
    if (aloesClientRoute === null) {
      return new Error('Error: Invalid pattern');
    }
    if (aloesClientRoute.appEui !== mqttBridge.username) {
      return new Error('Error: Invalid app Id');
    }
    const methodExists = protocolRef.validators.methods.some(
      meth => meth === aloesClientRoute.method,
    );
    const collectionNameExists = protocolRef.validators.collectionNames.some(
      name => name === aloesClientRoute.collectionName,
    );
    logger(4, 'mqtt-bridge', 'aloesClientRoute:res', {
      methodExists,
      collectionNameExists,
    });
    if (methodExists && collectionNameExists) {
      message = JSON.parse(message);
      if (message.gateway && message.direction && message.type) {
        switch (aloesClientRoute.collectionName.toLowerCase()) {
          case 'application':
            message = {...message};
            break;
          case 'device':
            message = {...message};
            break;
          case 'sensor':
            if (!message.sensor) {
              return new Error('Error: No sensor instance');
            }
            message = {...message};
            break;
          default:
            return new Error('Error: Comment est-ce possible?');
        }
        // read packet.mType ?

        send(message);
        return aloesClientRoute;
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
    if (client && mqttBridge.username) {
      await client.subscribe(`${mqttBridge.username}/+/+/+`);
    }
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
   */
  client.on('message', async (topic, message) =>
    parseBrokerMessage(topic, message),
  );
};

/**
 * Parse internal application messages
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
    logger.publish(4, 'mqtt-bridge', 'publish:req', message.gateway);
    let payload = null;
    const params = {
      appEui: mqttBridge.username,
      gatewayId: message.gateway.mac,
      collectionName: null,
      method: null,
    };
    if (message.payload) {
      params.collectionName = 'Device';
      payload = JSON.stringify({
        gateway: message.gateway,
        packet: message.payload,
        direction: message.direction,
        type: message.type,
      });
    } else if (message.node) {
      const node = message.node;
      params.collectionName = 'Device';
      if (node.auth === 'ABP') {
        if (!node.appSKey || !node.nwkSKey) {
          params.method = 'HEAD';
        } else if (node.id) {
          params.method = 'PUT';
        } else {
          params.method = 'POST';
        }
        payload = JSON.stringify({
          gateway: message.gateway,
          node,
          direction: message.direction,
          type: message.type,
        });
      } else if (node.auth === 'OTAA') {
        if (
          !node.appKey ||
          node.packet.getMType().toString('hex') === 'Join Request'
        ) {
          params.method = 'HEAD';
          return 'auth request';
        } else if (node.id) {
          params.method = 'PUT';
        } else {
          params.method = 'POST';
        }
        payload = JSON.stringify({
          gateway: message.gateway,
          node,
          direction: message.direction,
          type: message.type,
        });
      }
    } else if (message.sensor) {
      params.collectionName = 'Sensor';
      if (message.sensor.id) {
        params.method = 'PUT';
      } else {
        params.method = 'POST';
      }
      payload = JSON.stringify({
        gateway: message.gateway,
        sensor: message.sensor,
        direction: message.direction,
        type: message.type,
      });
    }
    if (
      params.collectionName === null ||
      params.method === null ||
      payload === null
    ) {
      return new Error('Error: invalid message');
    }

    //  console.log('publish', params);
    // if (params.method === 'PUT') {
    //   topic = mqttPattern.fill(protocolRef.externalPattern, params);
    // }
    const topic = mqttPattern.fill(protocolRef.externalPattern, params);
    logger.publish(4, 'mqtt-bridge', 'publish:res', {topic});
    await client.publish(topic, payload, {qos: 0});
    return null;
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
 * @param {object} config - Env variables
 */
const init = config => {
  logger.publish(3, 'mqtt-bridge', 'init', config.mqtt);
  /**
   * MQTT.JS Client.
   * @module mqttClient
   */
  const mqttClient = mqtt.connect(config.brokerUrl, config.mqtt);
  setBrokerListeners(mqttClient);
  setAppListeners(mqttClient);
};

/**
 * Event reporting that mqttBridge has to init.
 * @event module:mqttBridge~init
 * @param {object} config - Formatted config.
 */
mqttBridge.on('init', config => {
  init(config);
});
