import lorawan from 'lorawan-js';
import EventEmitter from 'events';
import otaaDecoder from './otaaDecoder';
import logger from './logger';

export const loraServer = new EventEmitter();
let lwServer;

loraServer.on('init', (config) => {
  logger.publish(3, 'server', 'init', config.lorawan);
  lwServer = new lorawan.Server(config.lorawan);
  lwServer.start();

  lwServer.on('error', err => {
    loraServer.emit('error', err);
  });

  lwServer.on('ready', (info, server) => {
    loraServer.emit('status', info);
  });

  lwServer.on('close', (info, server) => {
    loraServer.emit('status', info);
  });

  // lwServer.on('pullack', (message, clientInfo) => {});
  // lwServer.on('pullresp', (message, clientInfo) => {});

  lwServer.on('pushdata_status', (message, clientInfo) => {
    logger.publish(4, 'Gateway', 'status :', message.gateway);
    logger.publish(4, 'Server', 'pushdata_status', clientInfo);
  });

  lwServer.on('pushdata_rxpk', (message, clientInfo) => {
    try {
      const pdata = message.data.rxpk[0].data;
      const buff = Buffer.from(pdata, 'Base64');
      const loraPacket = lorawan.Packet(buff);
      logger.publish(4, 'Gateway', 'status :', message.gateway);
      logger.publish(
        4,
        'Server',
        '[Upstream] IN pushdata RXPK -',
        `${loraPacket.MType.Description}`,
      );

      if (loraPacket.MType.Description === 'JOIN REQUEST') {
        logger.publish(
          4,
          'Server',
          'from :',
          loraPacket.Buffers.MACPayload.FHDR.DevEui,
        );
      }

      loraServer.emit('pushdata_rxpk', {
        devAddr: loraPacket.Buffers.MACPayload.FHDR.DevAddr.toString('hex'),
        collectionName: 'LoraWanServer',
        method: loraPacket.MType.Description,
        payload: loraPacket,
      });

      return null;
    } catch (error) {
      return error;
    }
  });
});

loraServer.on('message', (topic, message) => {
  let NwkSKey;
  let AppSKey;
  if (message.devEui && message.appKey) {
    const result = otaaDecoder.decrypt(
      Buffer.from(message, 'hex'),
      Buffer.from(message.devNonce, 'hex'),
      Buffer.from(message.appKey, 'hex'),
    );
    NwkSKey = Buffer.from(result.NwkSKey, 'hex');
    AppSKey = Buffer.from(result.AppSKey, 'hex');
  } else if (message && message.devAddr === '03ff0001' && message.NwkSKey) {
    NwkSKey = Buffer.from('2B7E151628AED2A6ABF7158809CF4F3C', 'hex');
    AppSKey = Buffer.from('2B7E151628AED2A6ABF7158809CF4F3C', 'hex');
  }
  const decodedPayload = message.decryptWithKeys(AppSKey, NwkSKey);
  console.log(
    'decodedPayload: ',
    decodedPayload.toString('utf8'),
    ' - ',
    decodedPayload.length,
  );
  // console.log(
  //       'MY Time: ' +
  //         decodedPayload.readUInt32LE(0).toString() +
  //         ' Battery: ' +
  //         decodedPayload.readUInt8(4).toString() +
  //         ' Temperature: ' +
  //         decodedPayload.readUInt8(5).toString() +
  //         ' Lat: ' +
  //         decodedPayload.readUInt32LE(6).toString() +
  //         ' - Long: ' +
  //         decodedPayload.readUInt32LE(10).toString(),
  //     );
  loraServer.emit('decoded', {
    devAddr: message.devAddr,
    collectionName: 'LoraWanServer',
    payload: decodedPayload.toString('utf8'),
  });
});

loraServer.on('publish', options => {
  //  lwServer.pull_resp(txpk, tokens, clientInfo)
});

loraServer.on('close', () => {
  if (lwServer) {
    lwServer.stop();
  }
});
