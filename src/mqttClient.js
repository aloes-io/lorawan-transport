import mqtt from 'async-mqtt';
import mqttPattern from 'mqtt-pattern';
import EventEmitter from 'events';
import logger from './logger';

const pattern = '+userId/+collectionName/+method/+devAddr';

export const mqttClient = new EventEmitter();
let client;

mqttClient.on('init', config => {
  const conf = config;
  logger.publish(3, 'mqtt', 'init', config.mqtt);
  client = mqtt.connect(config.brokerUrl, config.mqtt);
  // mqttClient = {
  //   ...mqttClient,
  //   ...client,
  // };

  client.on('error', err => {
    // await client.subscribe()
    mqttClient.emit('error', err);
  });

  client.on('connect', async state => {
    // await client.subscribe()
    mqttClient.emit('status', state);
  });

  client.on('disconnect', state => {
    mqttClient.emit('status', state);
  });

  client.on('message', async (topic, message) => {
    mqttClient.emit('message', topic, message);
  });
});

mqttClient.on('publish', async options => {
  logger.publish(4, 'pubsub', 'publish:req', options);
  //  console.log("publish", client._client.MqttClient.options)
  if (!client || !client._client) {
    return new Error('Error: Invalid mqtt client');
  }
  if (options && client && client._client.options.username) {
    const params = {
      userId: client._client.options.username,
      collectionName: options.collectionName,
      devAddr: options.devAddr,
      method: options.method,
    };
    const route = mqttPattern.fill(pattern, params);
    await client.publish(route, JSON.stringify(options.payload), {qos: 1});
    return null;
  }
  return new Error('Error: Option must be an object type');
});

mqttClient.on('close', () => {
  if (client) {
    client.end();
  }
});
