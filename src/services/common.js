const protocolRef = {
  internalPattern: '+appEui/+gatewayId/+direction/+type',
  externalPattern: '+appEui/+collectionName/+method/+gatewayId',
  validators: {
    appEui: 'string',
    mTypes: [
      'Join Request',
      'Join Accept',
      'Confirmed Data Up',
      'Unconfirmed Data Up',
      'Confirmed Data Down',
      'Unconfirmed Data Down',
      'Proprietary',
      'Presentation',
    ],
    directions: ['RX', 'TX'],
    types: [
      'DECODED',
      'ENCODED',
      'PUSH_DATA',
      'PULL_DATA',
      'PULL_RESP',
      'PUSH_ACK',
      'PULL_ACK',
      'TX_ACK',
    ],
    collectionNames: [
      'Application',
      'Device',
      'Sensor',
      'VirtualObject',
      'IoTAgent',
    ],
    methods: ['HEAD', 'POST', 'GET', 'PUT', 'DELETE', 'STREAM'],
    gatewayId: 'string',
    device: ['devEui/devAddr', 'cayenneType'],
    devAddrLength: 8,
    devEuiLength: 16,
  },
};

module.exports = protocolRef;
