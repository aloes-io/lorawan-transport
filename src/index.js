import dotenv from 'dotenv';
import {appConfig} from './config';
import {loraServer} from './lorawanServer';
import {mqttClient} from './mqttClient';
import logger from './logger';

const result = dotenv.config();
if (result.error) {
  throw result.error;
}

loraServer.on('status', status => {
  logger.publish(4, 'server', 'status', status);
});

loraServer.on('error', error => {
  logger.publish(3, 'server', 'onError', error);
});

loraServer.on('pushdata_rxpk', options => {
  logger.publish(4, 'server', 'pushdata_rxpk', options);
  // if topic is an answer from device-manager ( method = pushdata_rxpk ),
  // if ABP auth find devAddr, nwsKey and appsKey
  // else if OTAA auth find devEui, appEui and appKey
  mqttClient.emit('publish', options);
});

// loraServer.on('decoded', options => {
//   logger.publish(4, 'server', 'decoded', options);
//   mqttClient.emit('publish', options);
// });

mqttClient.on('status', status => {
  logger.publish(3, 'mqtt', 'status', status);
});

mqttClient.on('error', error => {
  logger.publish(3, 'mqtt', 'onError', error);
});

mqttClient.on('message', (topic, message) => {
  logger.publish(3, 'mqtt', 'onMessage', topic);
  // if topic
  loraServer.emit('message', message);
});

appConfig.on('done', config => {
  logger.publish(3, 'config', 'done', config);
  loraServer.emit('init', config);
  mqttClient.emit('init', config);
});

appConfig.emit('init', result.parsed);

//  const appKey = Buffer.from('B6B53F4A168A7A88BDF7EA135CE9CFCA', 'hex');
//  const devNonce = Buffer.from('CC85', 'hex');
// Full packet: 0x20 MHDR, Join Accept (12 bytes, 16 bytes optional CFList, 4 bytes MIC)
// const phyPayload = Buffer.from(
//   '204dd85ae608b87fc4889970b7d2042c9e72959b0057aed6094b16003df12de145',
//   'hex',
// );
// const response = otaaDecoder.decrypt(appKey, devNonce, phyPayload);
// logger.publish(4, 'Server', 'response-test', response);
