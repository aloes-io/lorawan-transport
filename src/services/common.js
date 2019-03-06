/**
 * Oma Object References.
 * @external OmaObjects
 * @see {@link https://api.aloes.io/api/omaObjects}
 */

/**
 * Oma Resources References.
 * @external OmaResources
 * @see {@link https://api.aloes.io/api/omaResources}
 */

/**
 * References used to validate payloads
 * @namespace
 * @property {string}  internalPattern        - The pattern used by LoraWAN controller.
 * @property {string}  externalPattern        - The pattern used by MQTT bridge.
 * @property {object}  validators             - Check inputs / build outputs
 * @property {array}   validators.mTypes      - Used by LoraWAN Stack.
 * @property {array}   validators.types       - Used by LoraWAN Stack.
 * @property {array}   validators.collectionNames - Used to build AloesClient packet.
 * @property {array}   validators.methods     - Used to build AloesClient packet.
 */
const protocolRef = {
  internalPattern: '+appEui/+gatewayId/+direction/+type',
  externalPattern: '+appEui/+collectionName/+method/+gatewayId',
  externalCollectionPattern: '+appEui/+collectionName/+method',
  externalInstancePattern: '+appEui/+collectionName/+method/+modelId',
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
