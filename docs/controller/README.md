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
    * [~state](#module_loraWanApp..state) : <code>object</code>
    * [~networkOptions](#module_loraWanApp..networkOptions) : <code>object</code>
    * [~updateStore(model, content, [key])](#module_loraWanApp..updateStore)
    * [~getFromStore(model, [key])](#module_loraWanApp..getFromStore)
    * [~handleRXLoraPacket(message)](#module_loraWanApp..handleRXLoraPacket)
    * [~handleTXLoraPacket(message)](#module_loraWanApp..handleTXLoraPacket)
    * [~parseServerMessage(type, message, clientInfo)](#module_loraWanApp..parseServerMessage)
    * [~setServerListeners(server)](#module_loraWanApp..setServerListeners)
    * [~sendJoinAccept(server, message, appKey, packet)](#module_loraWanApp..sendJoinAccept) ⇒ <code>function</code>
    * [~updateDevice(node)](#module_loraWanApp..updateDevice) ⇒ <code>object</code>
    * [~publishSensorUpdates(sensors, message)](#module_loraWanApp..publishSensorUpdates) ⇒ <code>array</code>
    * [~handleRXAppMessage(message)](#module_loraWanApp..handleRXAppMessage)
    * [~handleTXAppMessage(server, message)](#module_loraWanApp..handleTXAppMessage) ⇒ <code>function</code>
    * [~parseAppMessage(server, message)](#module_loraWanApp..parseAppMessage)
    * [~setAppListeners(server)](#module_loraWanApp..setAppListeners)
    * [~init(conf)](#module_loraWanApp..init) ⇒ <code>object</code>
    * ["message" (message)](#module_loraWanApp..event_message) ⇒ <code>function</code>
    * ["close"](#module_loraWanApp..event_close)
    * ["init" (conf)](#module_loraWanApp..event_init)

<a name="module_loraWanApp..state"></a>

### loraWanApp~state : <code>object</code>
In memory nodes / sensors collection caching

**Kind**: inner namespace of [<code>loraWanApp</code>](#module_loraWanApp)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| gateways | <code>object</code> | Lorawan Gateways state |
| nodes | <code>object</code> | Lorawan Devices state |

<a name="module_loraWanApp..networkOptions"></a>

### loraWanApp~networkOptions : <code>object</code>
LoraWan network configuration
TODO : attribute this dynamically from app config ?

**Kind**: inner namespace of [<code>loraWanApp</code>](#module_loraWanApp)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| imme | <code>bool</code> | Sending payload immediatly ? |
| freq | <code>float</code> | Lorawan Gateway frequencies |
| rfch | <code>int</code> | Lorawan frequencies range |
| powe | <code>int</code> | Gateway antenna amplification |
| datr | <code>string</code> | Lora modulation |
| codr | <code>string</code> | Lora modulation |
| ncrc | <code>bool</code> | Deactivate CRC payload validation |
| ipol | <code>bool</code> | Inverse polarity |

<a name="module_loraWanApp..updateStore"></a>

### loraWanApp~updateStore(model, content, [key])
Update Storage collections

**Kind**: inner method of [<code>loraWanApp</code>](#module_loraWanApp)  
**Emits**: <code>module:loraWanApp~event:update</code>  

| Param | Type | Description |
| --- | --- | --- |
| model | <code>string</code> | Collection to update |
| content | <code>object</code> | New collection content |
| [key] | <code>string</code> | Instance/property to read |

<a name="module_loraWanApp..getFromStore"></a>

### loraWanApp~getFromStore(model, [key])
Find a Storage collection

**Kind**: inner method of [<code>loraWanApp</code>](#module_loraWanApp)  
**Emits**: <code>module:loraWanApp~event:find</code>  

| Param | Type | Description |
| --- | --- | --- |
| model | <code>string</code> | Collection to read |
| [key] | <code>string</code> | Instance/property to read |

<a name="module_loraWanApp..handleRXLoraPacket"></a>

### loraWanApp~handleRXLoraPacket(message)
Parse received packet from LoraWan Gateways

**Kind**: inner method of [<code>loraWanApp</code>](#module_loraWanApp)  
**Throws**:

- Will throw an error if the message.data is null.

**Emits**: <code>module:loraWanApp~event:RX</code>  

| Param | Type | Description |
| --- | --- | --- |
| message | <code>object</code> | Parsed JSON received from LoraWAN Server |

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

<a name="module_loraWanApp..sendJoinAccept"></a>

### loraWanApp~sendJoinAccept(server, message, appKey, packet) ⇒ <code>function</code>
Answer to valid join request

**Kind**: inner method of [<code>loraWanApp</code>](#module_loraWanApp)  
**Returns**: <code>function</code> - LoraWANServer.pullResp  

| Param | Type | Description |
| --- | --- | --- |
| server | <code>object</code> | LoraWAN Server |
| message | <code>object</code> | LoraWan Application message |
| appKey | <code>string</code> | Device AppKey |
| packet | <code>object</code> | LoraWan Application packet |

<a name="module_loraWanApp..updateDevice"></a>

### loraWanApp~updateDevice(node) ⇒ <code>object</code>
Update device with decoded results

**Kind**: inner method of [<code>loraWanApp</code>](#module_loraWanApp)  
**Returns**: <code>object</code> - node - Updated node  

| Param | Type | Description |
| --- | --- | --- |
| node | <code>object</code> | Found device instance |

<a name="module_loraWanApp..publishSensorUpdates"></a>

### loraWanApp~publishSensorUpdates(sensors, message) ⇒ <code>array</code>
Update state and publish to Aloes backend

**Kind**: inner method of [<code>loraWanApp</code>](#module_loraWanApp)  
**Returns**: <code>array</code> - sensors - Formatted sensors  

| Param | Type | Description |
| --- | --- | --- |
| sensors | <code>array</code> | Found device sensors |
| message | <code>object</code> | LoraWan App payload |

<a name="module_loraWanApp..handleRXAppMessage"></a>

### loraWanApp~handleRXAppMessage(message)
Dispatch incoming Lora packet

**Kind**: inner method of [<code>loraWanApp</code>](#module_loraWanApp)  
**Emits**: <code>module:loraWanApp~event:RX</code>  

| Param | Type | Description |
| --- | --- | --- |
| message | <code>object</code> | LoraWan App payload |

<a name="module_loraWanApp..handleTXAppMessage"></a>

### loraWanApp~handleTXAppMessage(server, message) ⇒ <code>function</code>
Dispatch outgoing Lora packet

**Kind**: inner method of [<code>loraWanApp</code>](#module_loraWanApp)  
**Returns**: <code>function</code> - LoraWANServer.pullResp  

| Param | Type | Description |
| --- | --- | --- |
| server | <code>object</code> | LoraWan Server instance |
| message | <code>object</code> | LoraWan App payload |

<a name="module_loraWanApp..parseAppMessage"></a>

### loraWanApp~parseAppMessage(server, message)
Parse internal application messages

**Kind**: inner method of [<code>loraWanApp</code>](#module_loraWanApp)  

| Param | Type | Description |
| --- | --- | --- |
| server | <code>object</code> | LoraWan Server instance |
| message | <code>object</code> | Parsed Application packet |

<a name="module_loraWanApp..setAppListeners"></a>

### loraWanApp~setAppListeners(server)
Listen to Application internal events

**Kind**: inner method of [<code>loraWanApp</code>](#module_loraWanApp)  

| Param | Type | Description |
| --- | --- | --- |
| server | <code>object</code> | LoraWan Server instance |

<a name="module_loraWanApp..init"></a>

### loraWanApp~init(conf) ⇒ <code>object</code>
Init LoraWan App

**Kind**: inner method of [<code>loraWanApp</code>](#module_loraWanApp)  
**Returns**: <code>object</code> - loraWanServer  

| Param | Type | Description |
| --- | --- | --- |
| conf | <code>object</code> | Env variables |
| conf.lorawan.portup | <code>number</code> | LoraWAN server UDP portup. |
| conf.lorawan.portdown | <code>number</code> | LoraWAN server UDP portdown. |
| conf.lorawan.port | <code>number</code> | LoraWAN server UDP port. |
| conf.lorawan.address | <code>string</code> | LoraWAN server UDP host. |
| conf.gateways | <code>object</code> | Initial gateways state value |
| conf.nodes | <code>object</code> | Initial nodes state value |

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

### "init" (conf)
Event reporting that loraWanApp has to init.

**Kind**: event emitted by [<code>loraWanApp</code>](#module_loraWanApp)  

| Param | Type | Description |
| --- | --- | --- |
| conf | <code>object</code> | Formatted config. |

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

