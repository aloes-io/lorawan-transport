/**
 * In memory nodes / sensors collection caching
 * @namespace
 * @property {string}  `[devId]` - Device Identifier ( devEui/devAddr )
 * @property {string}  `[devId].id` - Aloes deviceId
 * @property {string}  `[devId].name` - Device name
 * @property {string}  `[devId].auth` - OTAA / ABP
 * @property {string}  `[devId].devEui`
 * @property {string}  `[devId].devAddr`
 * @property {string}  `[devId].gwId` - gateway that trasmitted the last message ( MAC Address )
 * @property {string}  `[devId].transportProtocol` - Network protocol used by the device
 * @property {string}  `[devId].messageProtocol` - messageProtocol protocol used by the device
 * @property {string}  `[devId].protocolVersion`
 * @property {string}  `[devId][sensorId]` - sensor belonging to the device ( `sensor-${omaObjectId}-${nativeSensorId}` )
 * @property {string}  `[devId][sensorId].id` - Aloes sensorId
 * @property {string}  `[devId][sensorId].name` - Sensor name
 * @property {number}  `[devId][sensorId].type` - {@link https://api.aloes.io/api/omaObjects OMA Objects}
 * @property {number}  `[devId][sensorId].resource` - Last used oma resource
 * @property {object}  `[devId][sensorId].resources` - {@link https://api.aloes.io/api/omaResources OMA Resources}
 * @property {object}  `[devId][sensorId].colors` - {@link https://api.aloes.io/api/omaViews OMA Views}
 * @property {array}  `[devId][sensorId].icons` - {@link https://api.aloes.io/api/omaViews OMA Views}
 */
export const nodes = {
  '234243242': {
    id: null,
    auth: 'OTAA',
    transportProtocol: '',
    protocolVersion: '',
    packet: null,
    gwId: '23299492',
    devEui: '234243242',
    'sensor-3200-0': {
      id: null,
      packet: null,
      transportProtocol: 'loraWan',
      messageProtocol: 'cayenneLPP',
      protocolVersion: '',
      name: 'Digital output',
      icons: [],
      colors: null,
      nativeType: 0,
      nativeResource: 5500,
      nativeSensorId: 0,
      type: 3200,
      resources: {'5500': 0, '5501': 1},
      resource: 5500,
      value: 0,
      frameCounter: 0,
    },
  },
};
