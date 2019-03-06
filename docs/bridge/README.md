## Modules

<dl>
<dt><a href="#module_mqttBridge">mqttBridge</a></dt>
<dd><p>LoraWan Proxy</p>
</dd>
<dt><a href="#module_mqttClient">mqttClient</a></dt>
<dd><p>MQTT.JS Client.</p>
</dd>
</dl>

<a name="module_mqttBridge"></a>

## mqttBridge
LoraWan Proxy


* [mqttBridge](#module_mqttBridge)
    * [~send(message)](#module_mqttBridge..send)
    * [~parseBrokerMessage(topic, message)](#module_mqttBridge..parseBrokerMessage)
    * [~setBrokerListeners(client)](#module_mqttBridge..setBrokerListeners)
    * [~parseAppMessage(client, message)](#module_mqttBridge..parseAppMessage)
    * [~setAppListeners(server)](#module_mqttBridge..setAppListeners)
    * [~init(config)](#module_mqttBridge..init) ⇒ <code>object</code>
    * ["message"](#module_mqttBridge..event_message)
    * ["publish" (message)](#module_mqttBridge..event_publish) ⇒ <code>function</code>
    * ["close"](#module_mqttBridge..event_close)
    * ["init" (config)](#module_mqttBridge..event_init)

<a name="module_mqttBridge..send"></a>

### mqttBridge~send(message)
**Kind**: inner method of [<code>mqttBridge</code>](#module_mqttBridge)  
**Emits**: [<code>message</code>](#module_mqttBridge..event_message)  

| Param | Type | Description |
| --- | --- | --- |
| message | <code>object</code> | Formatted message |

<a name="module_mqttBridge..parseBrokerMessage"></a>

### mqttBridge~parseBrokerMessage(topic, message)
Parse message coming from MQTT broker

**Kind**: inner method of [<code>mqttBridge</code>](#module_mqttBridge)  

| Param | Type | Description |
| --- | --- | --- |
| topic | <code>string</code> | MQTT Topic |
| message | <code>object</code> | raw packet.payload |

<a name="module_mqttBridge..setBrokerListeners"></a>

### mqttBridge~setBrokerListeners(client)
Listen to MQTT Client events

**Kind**: inner method of [<code>mqttBridge</code>](#module_mqttBridge)  

| Param | Type | Description |
| --- | --- | --- |
| client | <code>object</code> | MQTT client instance |

<a name="module_mqttBridge..parseAppMessage"></a>

### mqttBridge~parseAppMessage(client, message)
Parse internal application messages coming from LoraWan-Controller

**Kind**: inner method of [<code>mqttBridge</code>](#module_mqttBridge)  

| Param | Type | Description |
| --- | --- | --- |
| client | <code>object</code> | MQTT client instance |
| message | <code>object</code> | Raw MQTT payload |

<a name="module_mqttBridge..setAppListeners"></a>

### mqttBridge~setAppListeners(server)
Listen to Application internal events

**Kind**: inner method of [<code>mqttBridge</code>](#module_mqttBridge)  

| Param | Type | Description |
| --- | --- | --- |
| server | <code>object</code> | LoraWan Server instance |

<a name="module_mqttBridge..init"></a>

### mqttBridge~init(config) ⇒ <code>object</code>
Init MQTT Bridge

**Kind**: inner method of [<code>mqttBridge</code>](#module_mqttBridge)  
**Returns**: <code>object</code> - mqttClient  

| Param | Type | Description |
| --- | --- | --- |
| config | <code>object</code> | Formatted configuration variables |
| config.brokerUrl | <code>string</code> | Remote MQTT broker |
| config.mqtt.clientId | <code>string</code> | Unique client Id |
| config.mqtt.username | <code>string</code> | Application Id |
| config.mqtt.password | <code>object</code> | Password, aka API key |

<a name="module_mqttBridge..event_message"></a>

### "message"
Event reporting that MQTT Client received a message.

**Kind**: event emitted by [<code>mqttBridge</code>](#module_mqttBridge)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| message | <code>object</code> | Message content. |

<a name="module_mqttBridge..event_publish"></a>

### "publish" (message) ⇒ <code>function</code>
Event reporting that mqttBridge has to proxy a message.

**Kind**: event emitted by [<code>mqttBridge</code>](#module_mqttBridge)  
**Returns**: <code>function</code> - parseAppMessage  

| Param | Type | Description |
| --- | --- | --- |
| message | <code>object</code> | LoraWan message. |

<a name="module_mqttBridge..event_close"></a>

### "close"
Event reporting that mqttBridge has to close.

**Kind**: event emitted by [<code>mqttBridge</code>](#module_mqttBridge)  
<a name="module_mqttBridge..event_init"></a>

### "init" (config)
Event reporting that mqttBridge has to init.

**Kind**: event emitted by [<code>mqttBridge</code>](#module_mqttBridge)  

| Param | Type | Description |
| --- | --- | --- |
| config | <code>object</code> | Formatted config. |

<a name="module_mqttClient"></a>

## mqttClient
MQTT.JS Client.


* [mqttClient](#module_mqttClient)
    * ["error" (error)](#module_mqttClient..event_error)
    * ["connect" (state)](#module_mqttClient..event_connect)
    * ["disconnect" (state)](#module_mqttClient..event_disconnect)
    * ["message" (topic, message)](#module_mqttClient..event_message) ⇒ <code>function</code>

<a name="module_mqttClient..event_error"></a>

### "error" (error)
**Kind**: event emitted by [<code>mqttClient</code>](#module_mqttClient)  
**Emits**: <code>module:mqttBridge~event:error</code>  

| Param | Type | Description |
| --- | --- | --- |
| error | <code>object</code> | Connection error |

<a name="module_mqttClient..event_connect"></a>

### "connect" (state)
**Kind**: event emitted by [<code>mqttClient</code>](#module_mqttClient)  
**Emits**: <code>module:mqttBridge~event:status</code>  

| Param | Type | Description |
| --- | --- | --- |
| state | <code>object</code> | Connection status |

<a name="module_mqttClient..event_disconnect"></a>

### "disconnect" (state)
**Kind**: event emitted by [<code>mqttClient</code>](#module_mqttClient)  
**Emits**: <code>module:mqttBridge~event:status</code>  

| Param | Type | Description |
| --- | --- | --- |
| state | <code>object</code> | Connection status |

<a name="module_mqttClient..event_message"></a>

### "message" (topic, message) ⇒ <code>function</code>
**Kind**: event emitted by [<code>mqttClient</code>](#module_mqttClient)  
**Returns**: <code>function</code> - parseBrokerMessage  

| Param | Type | Description |
| --- | --- | --- |
| topic | <code>object</code> | MQTT Topic |
| message | <code>object</code> | MQTT Payload |

