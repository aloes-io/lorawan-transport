import EventEmitter from 'events';
import logger from './services/logger';

export const appConfig = new EventEmitter();

appConfig.on('init', envVariables => {
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
  };

  appConfig.emit('done', config);
});
