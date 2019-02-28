## Modules

<dl>
<dt><a href="#module_loraWanApp">loraWanApp</a></dt>
<dd><p>loraWan Application</p>
</dd>
<dt><a href="#module_loraWanServer">loraWanServer</a></dt>
<dd><p>LoraWan Server.</p>
</dd>
</dl>

<a name="module_loraWanApp"></a>

## loraWanApp
loraWan Application


* [loraWanApp](#module_loraWanApp)
    * [~gateways](#module_loraWanApp..gateways) : <code>object</code>
    * [~nodes](#module_loraWanApp..nodes) : <code>object</code>
    * [~handleRXLoraPacket(message)](#module_loraWanApp..handleRXLoraPacket)
    * [~handleTXLoraPacket(message)](#module_loraWanApp..handleTXLoraPacket)
    * [~parseServerMessage(type, message, clientInfo)](#module_loraWanApp..parseServerMessage)
    * [~setServerListeners(server)](#module_loraWanApp..setServerListeners)
    * [~buildJoinAccept(node, appKey)](#module_loraWanApp..buildJoinAccept) ⇒ <code>function</code>
    * [~handleRXAppMessage(node)](#module_loraWanApp..handleRXAppMessage)
    * [~handleTXAppMessage(sensor)](#module_loraWanApp..handleTXAppMessage) ⇒ <code>function</code>
    * [~parseAppMessage(server, message)](#module_loraWanApp..parseAppMessage)
    * [~setAppListeners(server)](#module_loraWanApp..setAppListeners)
    * [~init(config)](#module_loraWanApp..init)
    * ["message" (message)](#module_loraWanApp..event_message) ⇒ <code>function</code>
    * ["close"](#module_loraWanApp..event_close)
    * ["init" (config)](#module_loraWanApp..event_init)

<a name="module_loraWanApp..gateways"></a>

### loraWanApp~gateways : <code>object</code>
In memory gateways collection caching

**Kind**: inner namespace of [<code>loraWanApp</code>](#module_loraWanApp)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| `mac` | <code>string</code> | Gateway MAC Address |
| `[mac].id` | <code>string</code> | Aloes deviceId |
| `[mac].mac` | <code>string</code> |  |
| `[mac].protocolName` | <code>string</code> |  |
| `[mac].protocolVersion` | <code>string</code> |  |

<a name="module_loraWanApp..nodes"></a>

### loraWanApp~nodes : <code>object</code>
In memory nodes / sensors collection caching

**Kind**: inner namespace of [<code>loraWanApp</code>](#module_loraWanApp)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| `[devId]` | <code>string</code> | Device Identifier ( devEui/devAddr ) |
| `[devId].id` | <code>string</code> | Aloes deviceId |
| `[devId].name` | <code>string</code> | Device name |
| `[devId].auth` | <code>string</code> | OTAA / ABP |
| `[devId].devEui` | <code>string</code> |  |
| `[devId].devAddr` | <code>string</code> |  |
| `[devId].gwId` | <code>string</code> | gateway that trasmitted the last message ( MAC Address ) |
| `[devId].protocolName` | <code>string</code> | Messaging protocol used by the device |
| `[devId].protocolVersion` | <code>string</code> |  |
| `[devId][sensorId]` | <code>string</code> | sensor belonging to the device ( `sensor-${omaObjectId}-${nativeSensorId}` ) |
| `[devId][sensorId].id` | <code>string</code> | Aloes sensorId |
| `[devId][sensorId].name` | <code>string</code> | Sensor name |
| `[devId][sensorId].type` | <code>number</code> | [OMA Objects](https://api.aloes.io/api/omaObjects) |
| `[devId][sensorId].resource` | <code>number</code> | Last used oma resource |
| `[devId][sensorId].resources` | <code>object</code> | [OMA Resources](https://api.aloes.io/api/omaResources) |
| `[devId][sensorId].colors` | <code>object</code> | [OMA Views](https://api.aloes.io/api/omaViews) |
| `[devId][sensorId].icons` | <code>array</code> | [OMA Views](https://api.aloes.io/api/omaViews) |

<a name="module_loraWanApp..handleRXLoraPacket"></a>

### loraWanApp~handleRXLoraPacket(message)
Parse received packet from LoraWan Gateways

**Kind**: inner method of [<code>loraWanApp</code>](#module_loraWanApp)  
**Throws**:

- Will throw an error if the message.data is null.

**Emits**: <code>module:loraWanApp~event:RX</code>  

| Param | Type | Description |
| --- | --- | --- |
| message | <code>object</code> | Parsed JSON |

<a name="module_loraWanApp..handleTXLoraPacket"></a>

### loraWanApp~handleTXLoraPacket(message)
Parse sent packet to LoraWan Gateways

**Kind**: inner method of [<code>loraWanApp</code>](#module_loraWanApp)  
**Emits**: <code>module:loraWanApp~event:TX</code>  

| Param | Type | Description |
| --- | --- | --- |
| message | <code>object</code> | Parsed JSON |

<a name="module_loraWanApp..parseServerMessage"></a>

### loraWanApp~parseServerMessage(type, message, clientInfo)
Parse message coming from LoraWan Gateways

**Kind**: inner method of [<code>loraWanApp</code>](#module_loraWanApp)  

| Param | Type | Description |
| --- | --- | --- |
| type | <code>string</code> | Message type. |
| message | <code>object</code> | Parsed UDP packet |
| clientInfo | <code>object</code> | Gateway infos |

<a name="module_loraWanApp..setServerListeners"></a>

### loraWanApp~setServerListeners(server)
Listen to LoraWan Gateways events

**Kind**: inner method of [<code>loraWanApp</code>](#module_loraWanApp)  

| Param | Type | Description |
| --- | --- | --- |
| server | <code>object</code> | LoraWan Server instance |

<a name="module_loraWanApp..buildJoinAccept"></a>

### loraWanApp~buildJoinAccept(node, appKey) ⇒ <code>function</code>
Answer to valid join request

**Kind**: inner method of [<code>loraWanApp</code>](#module_loraWanApp)  
**Returns**: <code>function</code> - LoraWANServer.pullResp  

| Param | Type | Description |
| --- | --- | --- |
| node | <code>object</code> | Found device instance |
| appKey | <code>string</code> | Device AppKey |

<a name="module_loraWanApp..handleRXAppMessage"></a>

### loraWanApp~handleRXAppMessage(node)
Dispatch incoming Lora packet

**Kind**: inner method of [<code>loraWanApp</code>](#module_loraWanApp)  
**Emits**: <code>module:loraWanApp~event:RX</code>  

| Param | Type | Description |
| --- | --- | --- |
| node | <code>object</code> | Found device instance |

<a name="module_loraWanApp..handleTXAppMessage"></a>

### loraWanApp~handleTXAppMessage(sensor) ⇒ <code>function</code>
Dispatch outgoing Lora packet

**Kind**: inner method of [<code>loraWanApp</code>](#module_loraWanApp)  
**Returns**: <code>function</code> - LoraWANServer.pullResp  

| Param | Type | Description |
| --- | --- | --- |
| sensor | <code>object</code> | Found sensor instance |

<a name="module_loraWanApp..parseAppMessage"></a>

### loraWanApp~parseAppMessage(server, message)
Parse internal application messages

**Kind**: inner method of [<code>loraWanApp</code>](#module_loraWanApp)  

| Param | Type | Description |
| --- | --- | --- |
| server | <code>object</code> | LoraWan Server instance |
| message | <code>object</code> | Parsed UDP packet |

<a name="module_loraWanApp..setAppListeners"></a>

### loraWanApp~setAppListeners(server)
Listen to Application internal events

**Kind**: inner method of [<code>loraWanApp</code>](#module_loraWanApp)  

| Param | Type | Description |
| --- | --- | --- |
| server | <code>object</code> | LoraWan Server instance |

<a name="module_loraWanApp..init"></a>

### loraWanApp~init(config)
Init LoraWan App

**Kind**: inner method of [<code>loraWanApp</code>](#module_loraWanApp)  

| Param | Type | Description |
| --- | --- | --- |
| config | <code>object</code> | Env variables |

<a name="module_loraWanApp..event_message"></a>

### "message" (message) ⇒ <code>function</code>
Event reporting that LoraWanApp has received MQTT packet.

**Kind**: event emitted by [<code>loraWanApp</code>](#module_loraWanApp)  
**Returns**: <code>function</code> - parseAppMessage  

| Param | Type | Description |
| --- | --- | --- |
| message | <code>object</code> | MQTT packet. |

<a name="module_loraWanApp..event_close"></a>

### "close"
Event reporting that loraWanApp has to close.

**Kind**: event emitted by [<code>loraWanApp</code>](#module_loraWanApp)  
<a name="module_loraWanApp..event_init"></a>

### "init" (config)
Event reporting that appConfig has to init.

**Kind**: event emitted by [<code>loraWanApp</code>](#module_loraWanApp)  

| Param | Type | Description |
| --- | --- | --- |
| config | <code>object</code> | Formatted config. |

<a name="module_loraWanServer"></a>

## loraWanServer
LoraWan Server.


* [loraWanServer](#module_loraWanServer)
    * ["error" (client, err)](#module_loraWanServer..event_error)
    * ["ready" (client, info)](#module_loraWanServer..event_ready)
    * ["close" (client, info)](#module_loraWanServer..event_close)
    * ["pushdata:status" (message, clientInfo)](#module_loraWanServer..pushdata_status)
    * ["pushack" (message, clientInfo)](#module_loraWanServer..event_pushack) ⇒ <code>function</code>
    * ["pullack" (message, clientInfo)](#module_loraWanServer..event_pullack) ⇒ <code>function</code>
    * ["txack" (message, clientInfo)](#module_loraWanServer..event_txack) ⇒ <code>function</code>
    * ["pushdata:rxpk" (message, clientInfo)](#module_loraWanServer..pushdata_rxpk) ⇒ <code>function</code>
    * ["pullresp:txpk" (message, clientInfo)](#module_loraWanServer..pullresp_txpk) ⇒ <code>function</code>

<a name="module_loraWanServer..event_error"></a>

### "error" (client, err)
**Kind**: event emitted by [<code>loraWanServer</code>](#module_loraWanServer)  
**Emits**: <code>module:loraWanApp~event:error</code>  

| Param | Type | Description |
| --- | --- | --- |
| client | <code>object</code> | Client config. |
| err | <code>object</code> | Connection error. |

<a name="module_loraWanServer..event_ready"></a>

### "ready" (client, info)
**Kind**: event emitted by [<code>loraWanServer</code>](#module_loraWanServer)  
**Emits**: <code>module:loraWanApp~event:status</code>  

| Param | Type | Description |
| --- | --- | --- |
| client | <code>object</code> | Client config. |
| info | <code>object</code> | Connection details. |

<a name="module_loraWanServer..event_close"></a>

### "close" (client, info)
**Kind**: event emitted by [<code>loraWanServer</code>](#module_loraWanServer)  
**Emits**: <code>module:loraWanApp~event:status</code>  

| Param | Type | Description |
| --- | --- | --- |
| client | <code>object</code> | Client config. |
| info | <code>object</code> | Connection details. |

<a name="module_loraWanServer..pushdata_status"></a>

### "pushdata:status" (message, clientInfo)
**Kind**: event emitted by [<code>loraWanServer</code>](#module_loraWanServer)  
**Emits**: <code>module:loraWanApp~event:status</code>  

| Param | Type | Description |
| --- | --- | --- |
| message | <code>object</code> | LoraWan full message. |
| clientInfo | <code>object</code> | Client config. |

<a name="module_loraWanServer..event_pushack"></a>

### "pushack" (message, clientInfo) ⇒ <code>function</code>
**Kind**: event emitted by [<code>loraWanServer</code>](#module_loraWanServer)  
**Returns**: <code>function</code> - parseServerMessage  

| Param | Type | Description |
| --- | --- | --- |
| message | <code>object</code> | LoraWan full message. |
| clientInfo | <code>object</code> | Client config. |

<a name="module_loraWanServer..event_pullack"></a>

### "pullack" (message, clientInfo) ⇒ <code>function</code>
**Kind**: event emitted by [<code>loraWanServer</code>](#module_loraWanServer)  
**Returns**: <code>function</code> - parseServerMessage  

| Param | Type | Description |
| --- | --- | --- |
| message | <code>object</code> | LoraWan full message. |
| clientInfo | <code>object</code> | Client config. |

<a name="module_loraWanServer..event_txack"></a>

### "txack" (message, clientInfo) ⇒ <code>function</code>
**Kind**: event emitted by [<code>loraWanServer</code>](#module_loraWanServer)  
**Returns**: <code>function</code> - parseServerMessage  

| Param | Type | Description |
| --- | --- | --- |
| message | <code>object</code> | LoraWan full message. |
| clientInfo | <code>object</code> | Client config. |

<a name="module_loraWanServer..pushdata_rxpk"></a>

### "pushdata:rxpk" (message, clientInfo) ⇒ <code>function</code>
**Kind**: event emitted by [<code>loraWanServer</code>](#module_loraWanServer)  
**Returns**: <code>function</code> - parseServerMessage  

| Param | Type | Description |
| --- | --- | --- |
| message | <code>object</code> | LoraWan full message. |
| clientInfo | <code>object</code> | Client config. |

<a name="module_loraWanServer..pullresp_txpk"></a>

### "pullresp:txpk" (message, clientInfo) ⇒ <code>function</code>
**Kind**: event emitted by [<code>loraWanServer</code>](#module_loraWanServer)  
**Returns**: <code>function</code> - parseServerMessage  

| Param | Type | Description |
| --- | --- | --- |
| message | <code>object</code> | LoraWan full message. |
| clientInfo | <code>object</code> | Client config. |

