import dotenv from 'dotenv';
import {appConfig} from './config';
import {loraWanApp} from './services/lorawan-controller';
import {mqttBridge} from './services/mqtt-bridge';
import logger from './services/logger';

const result = dotenv.config();
if (result.error) {
  throw result.error;
}
/**
 * @module LoraWanTransport
 */

/**
 * Mock reception of LoraPacket containing DevAddr
 * @method
 * @param {object} message - message variables.
 * @fires module:loraWanApp~message
 */
const testRXDevAddr = message => {
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
  return null;
};

/**
 * Mock reception of LoraPacket containing DevEUI
 * @method
 * @param {object} message - message content.
 * @fires module:loraWanApp~message
 */
const testRXDevEui = message => {
  const node = message.node;
  if (
    node.devEui &&
    node.devEui === '0004a30b001fbb91' &&
    !node.appKey &&
    node.packet.getMType().toLowerCase() === 'join request'
  ) {
    //  console.log(node.packet.toString('hex'));
    message.node.appKey = Buffer.from(
      'B6B53F4A168A7A88BDF7EA135CE9CFCA',
      'hex',
    );
    return loraWanApp.emit('message', message);
  }
  return null;
};

/**
 * @method
 */
const setListeners = () => {
  /**
   * @event module:loraWanApp~status
   * @param {object} state - status content.
   * @fires module:mqttBridge~publish
   */
  loraWanApp.on('status', (client, info) => {
    logger.publish(4, 'lora-server', 'status', {client, info});
    //  mqttBridge.emit('publish', options);
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
  loraWanApp.on('RX', message => {
    logger.publish(
      4,
      'lora-server',
      'RX',
      message.node.packet.getBuffers().PHYPayload.toString('hex'),
    );
    if (message.node && message.node.packet) {
      testRXDevEui(message);
      testRXDevAddr(message);
    }
    return mqttBridge.emit('publish', message);
  });

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
  mqttBridge.on('message', message => {
    logger.publish(3, 'mqtt-bridge', 'onMessage', message);
    // if topic & message
    // mock server response
    // else send to lorawan app
    if (message.gateway) {
      loraWanApp.emit('message', message);
    }
  });
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
   * @fires module:loraWanApp~init
   * @fires module:mqttBridge~init
   */
  appConfig.on('done', conf => {
    logger.publish(3, 'config', 'done', conf);
    /**
     * @module loraWanApp
     */
    loraWanApp.emit('init', conf);
    /**
     * @module mqttBridge
     */
    mqttBridge.emit('init', conf);
    setListeners();
  });
  appConfig.emit('init', envVariables);
};

initApp(result.parsed);
