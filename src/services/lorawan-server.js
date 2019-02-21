/*!
 * lorawan-js
 * Copyright(c) 2017 Dmitry Sukhamera
 * MIT Licensed
 */
const UDP_MSG_PRMBL_OFF = 12;
const PROTOCOL_VERSION = 2;

const PKT_PUSH_DATA = 0;
const PKT_PUSH_ACK = 1;
const PKT_PULL_DATA = 2;
const PKT_PULL_RESP = 3;
const PKT_PULL_ACK = 4;
const PKT_TX_ACK = 5;

/**
 * Module dependencies.
 */
const dgram = require('dgram');
const EventEmitter = require('events').EventEmitter;

function Server(opts, callback) {
  if (!(this instanceof Server)) {
    return new Server(opts, callback);
  }

  EventEmitter.call(this);

  this.opts = {};
  this.gateways = {};

  if (opts) {
    this.opts.address = opts.address || '0.0.0.0';
    if (opts.portup && opts.portdown && !opts.port) {
      if (opts.portup === opts.portdown) {
        this.opts.port = opts.portup;
      } else {
        this.opts.portup = opts.portup;
        this.opts.portdown = opts.portdown;
      }
    } else {
      this.opts.port = opts.port || 1700;
    }
  } else {
    this.opts.address = '0.0.0.0';
    this.opts.port = 1700;
  }

  this.status = 'STOP';
  //  const that = this;
}

module.exports = Server;

Server.prototype = Object.create(EventEmitter.prototype);

const pushAck = (that, clientInfo, tokens, gateway) => {
  try {
    const pushAckPkt = Buffer.alloc(4);
    pushAckPkt[0] = PROTOCOL_VERSION;
    pushAckPkt[1] = tokens.h;
    pushAckPkt[2] = tokens.l;
    pushAckPkt[3] = PKT_PUSH_ACK;

    const message = {
      protocol: PROTOCOL_VERSION,
      tokenH: tokens.h,
      tokenL: tokens.l,
      type: 'PUSH_ACK',
      direction: 'RX',
      gateway,
    };
    let socket;
    if (that.socketup) {
      socket = that.socketup;
    } else if (that.socket) {
      socket = that.socket;
    } else {
      return new Error('Error: No active socket connection');
    }
    return socket.send(
      pushAckPkt,
      0,
      pushAckPkt.length,
      clientInfo.port,
      clientInfo.address,
      err => {
        if (!err) {
          that.emit('pushack', message, clientInfo);
        }
      },
    );
  } catch (error) {
    return error;
  }
};

const pullAck = (that, clientInfo, tokens, gateway) => {
  try {
    const pullAckPkt = Buffer.alloc(4);
    pullAckPkt[0] = PROTOCOL_VERSION;
    pullAckPkt[1] = tokens.h;
    pullAckPkt[2] = tokens.l;
    pullAckPkt[3] = PKT_PULL_ACK;

    const message = {
      protocol: PROTOCOL_VERSION,
      tokenH: tokens.h,
      tokenL: tokens.l,
      type: 'PULL_ACK',
      direction: 'TX',
      gateway,
    };
    let socket;
    if (that.socketdown) {
      socket = that.socketdown;
    } else if (that.socket) {
      socket = that.socket;
    } else {
      return new Error('Error: No active socket connection');
    }
    return socket.send(
      pullAckPkt,
      0,
      pullAckPkt.length,
      clientInfo.port,
      clientInfo.address,
      err => {
        if (!err) {
          that.emit('pullack', message, clientInfo);
        }
      },
    );
  } catch (error) {
    return error;
  }
};

const socketDataToString = socketData => {
  const dataString = socketData.toString(
    'utf8',
    UDP_MSG_PRMBL_OFF,
    socketData.length,
  );
  if (dataString.length > 0) {
    return JSON.parse(dataString);
  }
  return '';
};

const parseMessage = async (that, socketData, clientInfo) => {
  try {
    const message = {};
    message.protocol = socketData[0];
    message.tokenH = socketData[1];
    message.tokenL = socketData[2];

    // PF macaddress
    const macaddress = Buffer.alloc(8);
    macaddress[0] = socketData[4];
    macaddress[1] = socketData[5];
    macaddress[2] = socketData[6];
    macaddress[3] = socketData[7];
    macaddress[4] = socketData[8];
    macaddress[5] = socketData[9];
    macaddress[6] = socketData[10];
    macaddress[7] = socketData[11];
    message.gateway = macaddress.toString('hex');

    // Packet direction
    switch (socketData[3]) {
      case PKT_PUSH_DATA:
        message.type = 'PUSH_DATA';
        message.direction = 'RX';
        message.data = await socketDataToString(socketData);
        await that.emit('pushdata', message, clientInfo);
        break;
      // case PKT_PUSH_ACK:
      //   message.type = 'PUSH_ACK';
      //   message.direction = 'DOWN';
      //   that.emit('pushack', message, clientInfo);
      //   break;
      case PKT_PULL_DATA:
        message.type = 'PULL_DATA';
        message.direction = 'TX';
        await that.emit('pulldata', message, clientInfo);
        break;
      // case PKT_PULL_ACK:
      //   message.type = 'PULL_ACK';
      //   message.direction = 'UP';
      //   that.emit('pullack', message, clientInfo);
      //   break;
      case PKT_TX_ACK:
        message.type = 'TX_ACK';
        message.direction = 'RX';
        message.data = await socketDataToString(socketData);
        await that.emit('txack', message, clientInfo);
        break;
      default:
        return 'Packet type not recognized';
    }
    return message;
  } catch (error) {
    return error;
  }
};

Server.prototype.stop = function stop() {
  if (this.status && this.opts.port) {
    this.socket.close();
  } else if (this.status) {
    this.socketup.close();
    this.socketdown.close();
  }
  //  else {
  //  console.log('Nothing to stop');
  //  }
};

Server.prototype.start = function start() {
  if (this.opts.port) {
    this.socket = dgram.createSocket('udp4');
    //  const asyncSend = promisify(this.socket.send);
    this.socket.bind(this.opts.port, this.opts.address);

    this.socket.on('listening', () => {
      this.status = 'RUN';
      this.emit('ready', this.socket.address());
    });
    this.socket.on('close', () => {
      this.status = 'STOP';
      this.emit('close', this.socket.address());
    });

    this.socket.on('error', err => {
      this.socket.close();
      this.emit('error', this.socket.address(), err);
    });

    this.socket.on('message', (socketData, clientInfo) => {
      parseMessage(this, socketData, clientInfo);
    });
  } else {
    this.socketup = dgram.createSocket('udp4');
    this.socketup.bind(this.opts.portup, this.opts.address);
    this.socketup.on('listening', () => {
      this.emit('ready', this.socketup.address(), 'RX');
    });

    this.socketdown = dgram.createSocket('udp4');
    this.socketdown.bind(this.opts.portdown, this.opts.address);
    this.socketdown.on('listening', () => {
      this.emit('ready', this.socketdown.address(), 'TX');
    });

    this.socketup.on('close', () => {
      this.emit('close', this.socketup.address(), 'RX');
    });
    this.socketdown.on('close', () => {
      this.emit('close', this.socketdown.address(), 'TX');
    });

    this.socketup.on('error', err => {
      this.socketup.close();
      this.socketdown.close();
      this.emit('error', this.socketup.address(), err, 'RX');
    });

    this.socketdown.on('error', err => {
      this.socketup.close();
      this.socketdown.close();
      this.emit('error', this.socketdown.address(), err, 'TX');
    });

    this.socketup.on('message', (socketData, clientInfo) => {
      parseMessage(this, socketData, clientInfo);
      //  this.emit('upLink', clientInfo);
    });

    this.socketdown.on('message', (socketData, clientInfo) => {
      parseMessage(this, socketData, clientInfo);
      //  this.emit('downLink', clientInfo);
    });
  }
  if (this.socket || (this.socketup && this.socketdown)) {
    this.on('pushdata', (message, clientInfo) => {
      const tokens = {h: message.tokenH, l: message.tokenL};
      if (message.data.stat) {
        this.emit('pushdata:status', message, clientInfo);
      } else if (message.data.rxpk) {
        this.emit('pushdata:rxpk', message, clientInfo);
      }
      // todo add message.data in push_ack to resolve it after ?
      pushAck(this, clientInfo, tokens, message.gateway);
    });

    this.on('pulldata', (message, clientInfo) => {
      const tokens = {h: message.tokenH, l: message.tokenL};
      if (message.txpk) {
        this.emit('pulldata:txpk', message, clientInfo);
      }
      pullAck(this, clientInfo, tokens, message.gateway);
    });

    this.on('pullresp', (message, clientInfo) => {
      //  const tokens = {h: message.tokenH, l: message.tokenL};
      if (message.txpk) {
        this.emit('pullresp:txpk', message, clientInfo);
      }
      //  pullAck(this, clientInfo, tokens,message.gateway);
    });

    //  this.on('txack', (message, clientInfo) => {});
  }
};

Server.prototype.pullResp = function pullResp(
  txpk,
  tokens,
  clientInfo,
  gateway,
) {
  const pullRespPkgH = Buffer.alloc(4);
  pullRespPkgH[0] = PROTOCOL_VERSION;
  pullRespPkgH[1] = tokens.h;
  pullRespPkgH[2] = tokens.l;
  pullRespPkgH[3] = PKT_PULL_RESP;

  if (txpk) {
    txpk.imme = txpk.imme || true; //  bool, Send packet immediately (will ignore tmst & time)
    txpk.tmst = txpk.tmst || Date.now() + 100; //  number, Send packet on a certain timestamp value (will ignore time)
    txpk.tmms = txpk.tmms || Date.now() + 100; //  number, Send packet at a certain GPS time (GPS synchronization required)
    txpk.freq = txpk.freq || 869.525; //  number, TX central frequency in MHz (unsigned float, Hz precision)
    txpk.rfch = txpk.rfch || 0; //  number, Concentrator "RF chain" used for TX (unsigned integer)
    txpk.powe = txpk.powe || 14; // number, TX output power in dBm (unsigned integer, dBm precision)
    txpk.modu = txpk.modu || 'LORA'; // string, Modulation identifier "LORA" or "FSK"
    txpk.datr = txpk.datr || 'SF12BW500'; // string, LoRa datarate identifier (eg. SF12BW500)
    txpk.codr = txpk.codr || '4/5'; // string, LoRa ECC coding rate identifier
    txpk.fdev = txpk.fdev || 3000; // number, FSK frequency deviation (unsigned integer, in Hz)
    txpk.ipol = txpk.ipol || true; // bool, Lora modulation polarization inversion
    txpk.prea = txpk.prea || 0; // number, RF preamble size (unsigned integer)
    txpk.ncrc = txpk.ncrc || false; // bool, If true, disable the CRC of the physical layer (optional)
    txpk.data = txpk.data || ''; // string, Base64 encoded RF packet payload, padding optional
    const dataSize = Buffer.from(txpk.data, 'base64');
    txpk.size = txpk.size || dataSize.length; // number, RF packet payload size in bytes (unsigned integer)
  }

  const message = {
    protocol: PROTOCOL_VERSION,
    tokenH: tokens.h,
    tokenL: tokens.l,
    type: 'PULL_RESP',
    direction: 'TX',
    txpk,
    gateway,
  };

  const pullRespPkgB = Buffer.from(JSON.stringify({txpk}), 'utf-8');
  const pullRespPkg = Buffer.concat([pullRespPkgH, pullRespPkgB]);

  let socket;
  if (this.socketdown) {
    socket = this.socketdown;
  } else if (this.socket) {
    socket = this.socket;
  } else {
    return new Error('Error: No active socket connection');
  }

  return socket.send(
    pullRespPkg,
    0,
    pullRespPkg.length,
    clientInfo.port,
    clientInfo.address,
    err => {
      if (!err) {
        this.emit('pullresp', message, clientInfo);
      }
    },
  );
};
