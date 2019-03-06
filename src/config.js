import EventEmitter from 'events';
import path from 'path';
import logger from './services/logger';

/**
 * @module appConfig
 */
export const appConfig = new EventEmitter();

/**
 * Init Application config
 * @param {object} config - Env variables
 * @param {string} config.brokerUrl - MQTT Broker URL
 * @param {object} config.mqtt - MQTT client config
 * @param {object} config.lorawan - LoraWan server config
 * @param {object} config.redis - Redis client config
 * @param {object} config.fileStore - FS path config
 * @param {string} [config.storage] - Storage type ( "inMemory", "inFile", "cacheStorage" )
 * @fires module:appConfig~done
 */
const init = envVariables => {
  logger.publish(3, 'config', 'init', envVariables);
  const config = {
    brokerUrl: envVariables.MQTT_BROKER_URL,
    mqtt: {
      protocolId: 'MQTT',
      protocolVersion: 4,
      reconnectPeriod: 5000,
      connectTimeout: 30 * 1000,
      clean: true,
      clientId: `${envVariables.MQTT_BROKER_USER}-${Math.random()
        .toString(16)
        .substr(2, 8)}`,
      username: envVariables.MQTT_BROKER_USER,
      password: envVariables.MQTT_BROKER_PASS,
      // keepalive: 60,
      // reschedulePings: true,
    },
    lorawan: {
      //  port: Number(envVariables.LORA_SERVER_PORT),
      portup: Number(envVariables.LORA_SERVER_PORT_UP),
      portdown: Number(envVariables.LORA_SERVER_PORT_DOWN),
      address: envVariables.LORA_SERVER_HOST,
    },
    redis: {
      db: process.env.REDIS_COLLECTION || '4',
      host: process.env.REDIS_HOST || 'localhost',
      port: Number(process.env.REDIS_PORT) || 6379,
    },
    fileStore: {
      gateways: path.join(__dirname, 'store/gateways-store.json'),
      nodes: path.join(__dirname, 'store/nodes-store.json'),
    },
    storage: process.env.STORAGE || 'inFile', // 'cacheStorage' or 'inFile'
  };
  /**
   * Event reporting that appConfig has done the job.
   * @event module:appConfig~done
   * @param {object} config - Configuration set by env variables.
   */
  appConfig.emit('done', config);
};

/**
 * Event reporting that appConfig has to init.
 * @event module:appConfig~init
 * @param {object} envVariables - Environment variables.
 */
appConfig.on('init', envVariables => {
  init(envVariables);
});
