/* eslint-disable no-console */
import colors from 'colors';

colors.setTheme({
  LORA_SERVER: ['green', 'bold'],
  LORA_HANDLER: ['yellow', 'bold'],
  MQTT_BRIDGE: ['blue', 'bold'],
  CACHE_STORE: ['white', 'bold', 'bgGreen'],
  CONFIG: ['white', 'bold', 'bgBlue'],
  DEFAULT: 'white',
  warn: 'yellow',
  error: 'red',
});

const logger = {};

/**
 * @module logger
 * @param {int} priority - Logger mode.
 * @param {string} collectionName - service name.
 * @param {string} command - service command to log.
 * @param {string} content - log content.
 */
logger.publish = (priority, collectionName, command, content) => {
  const logLevel = Number(process.env.SERVER_LOGGER_LEVEL) || 4;
  let fullContent;
  if (priority <= logLevel) {
    if (typeof content === 'object') {
      fullContent = `[${collectionName.toUpperCase()}] ${command} : ${JSON.stringify(
        content,
      )}`;
    } else if (typeof content !== 'object') {
      fullContent = `[${collectionName.toUpperCase()}] ${command} : ${content}`;
    }
    switch (collectionName.toUpperCase()) {
      case 'CONFIG':
        console.log(`${fullContent}`.CONFIG);
        break;
      case 'LORA-SERVER':
        console.log(`${fullContent}`.LORA_SERVER);
        break;
      case 'LORA-HANDLER':
        console.log(`${fullContent}`.LORA_HANDLER);
        break;
      case 'MQTT-BRIDGE':
        console.log(`${fullContent}`.MQTT_BRIDGE);
        break;
      case 'CACHE-STORE':
        console.log(`${fullContent}`.CACHE_STORE);
        break;
      default:
        console.log(`${fullContent}`.DEFAULT);
    }
    return null;
  } else if (priority > logLevel) {
    return null;
  }
  const error = new Error('INVALID_LOG: Missing argument in logger');
  throw error;
};

export default logger;
