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
    * [~parseRXLoraPacket(message)](#module_loraWanApp..parseRXLoraPacket)
    * [~parseTXLoraPacket(message)](#module_loraWanApp..parseTXLoraPacket)
    * [~parseServerMessage(type, message, clientInfo)](#module_loraWanApp..parseServerMessage)
    * [~setServerListeners(server)](#module_loraWanApp..setServerListeners)
    * [~parseAppMessage(server, message)](#module_loraWanApp..parseAppMessage)
    * [~setAppListeners(server)](#module_loraWanApp..setAppListeners)
    * [~init(config)](#module_loraWanApp..init)
    * ["message" (message)](#module_loraWanApp..event_message)
    * ["close"](#module_loraWanApp..event_close)
    * ["init" (config)](#module_loraWanApp..event_init)

<a name="module_loraWanApp..parseRXLoraPacket"></a>

### loraWanApp~parseRXLoraPacket(message)
Parse received packet from LoraWan Gateways

**Kind**: inner method of [<code>loraWanApp</code>](#module_loraWanApp)  
**Emits**: <code>module:loraWanApp~event:RX</code>  

| Param | Type | Description |
| --- | --- | --- |
| message | <code>object</code> | Parsed JSON |

<a name="module_loraWanApp..parseTXLoraPacket"></a>

### loraWanApp~parseTXLoraPacket(message)
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

### "message" (message)
Event reporting that LoraWanApp has received MQTT packet.

**Kind**: event emitted by [<code>loraWanApp</code>](#module_loraWanApp)  

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
    * ["pushack" (message, clientInfo)](#module_loraWanServer..event_pushack)
    * ["pullack" (message, clientInfo)](#module_loraWanServer..event_pullack)
    * ["txack" (message, clientInfo)](#module_loraWanServer..event_txack)
    * ["pushdata:rxpk" (message, clientInfo)](#module_loraWanServer..pushdata_rxpk)
    * ["pullresp:txpk" (message, clientInfo)](#module_loraWanServer..pullresp_txpk)

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

### "pushack" (message, clientInfo)
**Kind**: event emitted by [<code>loraWanServer</code>](#module_loraWanServer)  

| Param | Type | Description |
| --- | --- | --- |
| message | <code>object</code> | LoraWan full message. |
| clientInfo | <code>object</code> | Client config. |

<a name="module_loraWanServer..event_pullack"></a>

### "pullack" (message, clientInfo)
**Kind**: event emitted by [<code>loraWanServer</code>](#module_loraWanServer)  

| Param | Type | Description |
| --- | --- | --- |
| message | <code>object</code> | LoraWan full message. |
| clientInfo | <code>object</code> | Client config. |

<a name="module_loraWanServer..event_txack"></a>

### "txack" (message, clientInfo)
**Kind**: event emitted by [<code>loraWanServer</code>](#module_loraWanServer)  

| Param | Type | Description |
| --- | --- | --- |
| message | <code>object</code> | LoraWan full message. |
| clientInfo | <code>object</code> | Client config. |

<a name="module_loraWanServer..pushdata_rxpk"></a>

### "pushdata:rxpk" (message, clientInfo)
**Kind**: event emitted by [<code>loraWanServer</code>](#module_loraWanServer)  

| Param | Type | Description |
| --- | --- | --- |
| message | <code>object</code> | LoraWan full message. |
| clientInfo | <code>object</code> | Client config. |

<a name="module_loraWanServer..pullresp_txpk"></a>

### "pullresp:txpk" (message, clientInfo)
**Kind**: event emitted by [<code>loraWanServer</code>](#module_loraWanServer)  

| Param | Type | Description |
| --- | --- | --- |
| message | <code>object</code> | LoraWan full message. |
| clientInfo | <code>object</code> | Client config. |

