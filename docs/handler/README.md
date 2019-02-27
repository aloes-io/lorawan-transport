<a name="module_loraWanHandler"></a>

## loraWanHandler

* [loraWanHandler](#module_loraWanHandler)
    * [~decodePacket(buffer)](#module_loraWanHandler..decodePacket) ⇒ <code>object</code>
    * [~parseCayennePayload(packet, appSKey, nwkSKey)](#module_loraWanHandler..parseCayennePayload) ⇒ <code>object</code>
    * [~buildCayennePayload(sensor)](#module_loraWanHandler..buildCayennePayload) ⇒ <code>object</code>
    * [~resolveJoinRequest(packet, appKey, netID)](#module_loraWanHandler..resolveJoinRequest) ⇒ <code>object</code>
    * [~buildPacket(options)](#module_loraWanHandler..buildPacket) ⇒ <code>object</code>

<a name="module_loraWanHandler..decodePacket"></a>

### loraWanHandler~decodePacket(buffer) ⇒ <code>object</code>
**Kind**: inner method of [<code>loraWanHandler</code>](#module_loraWanHandler)  
**Returns**: <code>object</code> - packet  

| Param | Type | Description |
| --- | --- | --- |
| buffer | <code>object</code> | Buffer containing LoRaPacket. |

<a name="module_loraWanHandler..parseCayennePayload"></a>

### loraWanHandler~parseCayennePayload(packet, appSKey, nwkSKey) ⇒ <code>object</code>
**Kind**: inner method of [<code>loraWanHandler</code>](#module_loraWanHandler)  
**Returns**: <code>object</code> - packet - {loraPacket, caynnePayload}  

| Param | Type | Description |
| --- | --- | --- |
| packet | <code>object</code> | LoRaPacket. |
| appSKey | <code>object</code> | LoraWAN AppSKey. |
| nwkSKey | <code>object</code> | LoraWAN NwkSKey. |

<a name="module_loraWanHandler..buildCayennePayload"></a>

### loraWanHandler~buildCayennePayload(sensor) ⇒ <code>object</code>
**Kind**: inner method of [<code>loraWanHandler</code>](#module_loraWanHandler)  
**Returns**: <code>object</code> - cayennePayload  

| Param | Type | Description |
| --- | --- | --- |
| sensor | <code>object</code> | AloesClient sensor instance. |

<a name="module_loraWanHandler..resolveJoinRequest"></a>

### loraWanHandler~resolveJoinRequest(packet, appKey, netID) ⇒ <code>object</code>
**Kind**: inner method of [<code>loraWanHandler</code>](#module_loraWanHandler)  
**Returns**: <code>object</code> - decoded - {appNonce, netID, nwkSKey, appSKey}  

| Param | Type | Description |
| --- | --- | --- |
| packet | <code>object</code> | LoRaPacket. |
| appKey | <code>object</code> | LoraWAN appKey. |
| netID | <code>number</code> | LoraWAN netID. |

<a name="module_loraWanHandler..buildPacket"></a>

### loraWanHandler~buildPacket(options) ⇒ <code>object</code>
**Kind**: inner method of [<code>loraWanHandler</code>](#module_loraWanHandler)  
**Returns**: <code>object</code> - txpk  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>object</code> | Options containing LoRaWAN full Packet parameters. |

