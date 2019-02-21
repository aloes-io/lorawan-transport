import dotenv from 'dotenv';
import {appConfig} from './config';
import {loraWanApp} from './services/lorawan-app';
import {mqttBridge} from './services/mqtt-bridge';
import logger from './services/logger';

const result = dotenv.config();
if (result.error) {
  throw result.error;
}

loraWanApp.on('status', (server, info) => {
  logger.publish(4, 'lora-server', 'status', {server, info});
  //  mqttBridge.emit('publish', options);
});

loraWanApp.on('error', (server, error) => {
  logger.publish(4, 'lora-server', 'error', {server, error});
});

loraWanApp.on('TX', message => {
  //  logger.publish(4, 'lora-server', 'TX', message);
  mqttBridge.emit('publish', message);
});

loraWanApp.on('RX', message => {
  //  logger.publish(4, 'lora-server', 'RX', message);
  // test
  console.log(
    'RX',
    message.node.packet.getBuffers().PHYPayload.toString('hex'),
  );

  if (message.node && message.node.packet) {
    const node = message.node;
    if (!node.appSKey && node.devAddr && node.devAddr === '03ff0001') {
      message.node.nwkSKey = Buffer.from(
        '2B7E151628AED2A6ABF7158809CF4F3C',
        'hex',
      );
      message.node.appSKey = Buffer.from(
        '2B7E151628AED2A6ABF7158809CF4F3C',
        'hex',
      );
      return loraWanApp.emit('message', message);
    }
    if (
      node.devEui &&
      node.devEui === '0004a30b001fbb91' &&
      !node.appKey &&
      node.packet.getMType().toLowerCase() === 'join request'
    ) {
      console.log(node.packet.toString('hex'));
      message.node.appKey = Buffer.from(
        'B6B53F4A168A7A88BDF7EA135CE9CFCA',
        'hex',
      );
      return loraWanApp.emit('message', message);
    }
  }
  return mqttBridge.emit('publish', message);
});

mqttBridge.on('status', status => {
  logger.publish(4, 'mqtt-bridge', 'status', status);
});

mqttBridge.on('error', error => {
  logger.publish(3, 'mqtt-bridge', 'onError', error);
});

mqttBridge.on('message', message => {
  logger.publish(3, 'mqtt-bridge', 'onMessage', message);
  // if topic & message
  // mock server response
  // else send to lorwan app
  if (message.gateway) {
    loraWanApp.emit('message', message);
  }
});

appConfig.on('done', config => {
  logger.publish(3, 'config', 'done', config);
  loraWanApp.emit('init', config);
  mqttBridge.emit('init', config);
});

appConfig.emit('init', result.parsed);
