<a name="loraWanHandler"></a>

## loraWanHandler : <code>object</code>
LoraWan Application Packet handler, using lora-packet.js

**Kind**: global namespace  

* [loraWanHandler](#loraWanHandler) : <code>object</code>
    * [.decodePacket(payload)](#loraWanHandler.decodePacket) ⇒ <code>object</code>
    * [.parseCayennePayload(packet, appSKey, nwkSKey)](#loraWanHandler.parseCayennePayload) ⇒ <code>object</code>
    * [.buildCayennePayload(sensor)](#loraWanHandler.buildCayennePayload) ⇒ <code>object</code>
    * [.updateCayenneSensors(node, cayennePayload)](#loraWanHandler.updateCayenneSensors) ⇒ <code>array</code>
    * [.resolveJoinRequest(packet, appKey, netID)](#loraWanHandler.resolveJoinRequest) ⇒ <code>object</code>
    * [.buildPacket(options)](#loraWanHandler.buildPacket) ⇒ <code>object</code>
    * [.buildJoinAccept(message, appKey, packet, networkOptions)](#loraWanHandler.buildJoinAccept) ⇒ <code>object</code>

<a name="loraWanHandler.decodePacket"></a>

### loraWanHandler.decodePacket(payload) ⇒ <code>object</code>
**Kind**: static method of [<code>loraWanHandler</code>](#loraWanHandler)  
**Returns**: <code>object</code> - packet  

| Param | Type | Description |
| --- | --- | --- |
| payload | <code>object</code> | PHYpayload as base64 string. |

<a name="loraWanHandler.parseCayennePayload"></a>

### loraWanHandler.parseCayennePayload(packet, appSKey, nwkSKey) ⇒ <code>object</code>
**Kind**: static method of [<code>loraWanHandler</code>](#loraWanHandler)  
**Returns**: <code>object</code> - packet - {loraPacket, caynnePayload}  

| Param | Type | Description |
| --- | --- | --- |
| packet | <code>object</code> | LoRaPacket. |
| appSKey | <code>object</code> | LoraWAN AppSKey. |
| nwkSKey | <code>object</code> | LoraWAN NwkSKey. |

<a name="loraWanHandler.buildCayennePayload"></a>

### loraWanHandler.buildCayennePayload(sensor) ⇒ <code>object</code>
**Kind**: static method of [<code>loraWanHandler</code>](#loraWanHandler)  
**Returns**: <code>object</code> - cayennePayload  

| Param | Type | Description |
| --- | --- | --- |
| sensor | <code>object</code> | AloesClient sensor instance. |

<a name="loraWanHandler.updateCayenneSensors"></a>

### loraWanHandler.updateCayenneSensors(node, cayennePayload) ⇒ <code>array</code>
Compose sensor collection based on aloes client schema

**Kind**: static method of [<code>loraWanHandler</code>](#loraWanHandler)  
**Returns**: <code>array</code> - sensors  
**Emits**: <code>module:loraWanApp~event:RX</code>  

| Param | Type | Description |
| --- | --- | --- |
| node | <code>object</code> | Found device instance |
| cayennePayload | <code>object</code> | Decoded cayenne payload |

<a name="loraWanHandler.resolveJoinRequest"></a>

### loraWanHandler.resolveJoinRequest(packet, appKey, netID) ⇒ <code>object</code>
**Kind**: static method of [<code>loraWanHandler</code>](#loraWanHandler)  
**Returns**: <code>object</code> - decoded - {appNonce, netID, nwkSKey, appSKey}  

| Param | Type | Description |
| --- | --- | --- |
| packet | <code>object</code> | LoRaPacket. |
| appKey | <code>string</code> | LoraWAN appKey. |
| netID | <code>number</code> | LoraWAN netID. |

<a name="loraWanHandler.buildPacket"></a>

### loraWanHandler.buildPacket(options) ⇒ <code>object</code>
**Kind**: static method of [<code>loraWanHandler</code>](#loraWanHandler)  
**Returns**: <code>object</code> - txpk  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>object</code> | Options containing LoRaWAN full Packet parameters. |
| options.devAddr | <code>string</code> | LoraWan DevAddr. |
| options.nwkSKey | <code>string</code> | LoraWan NwkSKey. |
| options.appSKey | <code>string</code> | LoraWan AppSKey. |
| options.mType | <code>string</code> | LoraWan MType. |

<a name="loraWanHandler.buildJoinAccept"></a>

### loraWanHandler.buildJoinAccept(message, appKey, packet, networkOptions) ⇒ <code>object</code>
Compose a Join Accept packet

**Kind**: static method of [<code>loraWanHandler</code>](#loraWanHandler)  
**Returns**: <code>object</code> - txpk  

| Param | Type | Description |
| --- | --- | --- |
| message | <code>object</code> | LoraWan Application message |
| appKey | <code>string</code> | Device AppKey |
| packet | <code>object</code> | LoraWan Application packet |
| networkOptions | <code>object</code> | LoraWan Application network config |

