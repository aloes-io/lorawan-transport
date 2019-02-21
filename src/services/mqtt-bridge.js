/* eslint-disable no-underscore-dangle */
import mqtt from 'async-mqtt';
import mqttPattern from 'mqtt-pattern';
import EventEmitter from 'events';
import protocolRef from './common';
import logger from './logger';

export const mqttBridge = new EventEmitter();
let client;

mqttBridge.on('init', config => {
  logger.publish(3, 'mqtt-bridge', 'init', config.mqtt);
  client = mqtt.connect(config.brokerUrl, config.mqtt);

  client.on('error', err => {
    mqttBridge.emit('error', err);
  });

  client.on('connect', async state => {
    mqttBridge.emit('status', state);
    mqttBridge.username = client._client.options.username;
    mqttBridge.connected = true;
    if (client && mqttBridge.username) {
      await client.subscribe(`${mqttBridge.username}/+/+/+`);
    }
  });

  client.on('disconnect', state => {
    delete mqttBridge.username;
    mqttBridge.connected = false;
    mqttBridge.emit('status', state);
  });

  client.on('message', async (topic, message) => {
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
          mqttBridge.emit('message', message);
          return aloesClientRoute;
        }
        return new Error('Error: Invalid message');
      }
      return new Error('Error: Invalid pattern');
    } catch (error) {
      return error;
    }
  });
});

mqttBridge.on('publish', async message => {
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
});

mqttBridge.on('close', () => {
  if (client) {
    client.end();
  }
});
