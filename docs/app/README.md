## Modules

<dl>
<dt><a href="#module_LoraWanTransport">LoraWanTransport</a></dt>
<dd></dd>
<dt><a href="#module_cacheStore">cacheStore</a></dt>
<dd></dd>
<dt><a href="#module_fileStore">fileStore</a></dt>
<dd></dd>
<dt><a href="#module_loraWanApp">loraWanApp</a></dt>
<dd></dd>
<dt><a href="#module_mqttBridge">mqttBridge</a></dt>
<dd></dd>
</dl>

## Objects

<dl>
<dt><a href="#result">result</a> : <code>object</code></dt>
<dd><p>Parsed environment variables</p>
</dd>
<dt><a href="#state">state</a> : <code>object</code></dt>
<dd><p>In memory nodes / sensors collection caching</p>
</dd>
</dl>

<a name="module_LoraWanTransport"></a>

## LoraWanTransport

* [LoraWanTransport](#module_LoraWanTransport)
    * [~setLoraWanAppListeners()](#module_LoraWanTransport..setLoraWanAppListeners)
    * [~setMqttBridgeListeners()](#module_LoraWanTransport..setMqttBridgeListeners)
    * [~initServices(conf)](#module_LoraWanTransport..initServices) ⇒ <code>object</code>

<a name="module_LoraWanTransport..setLoraWanAppListeners"></a>

### LoraWanTransport~setLoraWanAppListeners()
**Kind**: inner method of [<code>LoraWanTransport</code>](#module_LoraWanTransport)  
<a name="module_LoraWanTransport..setMqttBridgeListeners"></a>

### LoraWanTransport~setMqttBridgeListeners()
**Kind**: inner method of [<code>LoraWanTransport</code>](#module_LoraWanTransport)  
<a name="module_LoraWanTransport..initServices"></a>

### LoraWanTransport~initServices(conf) ⇒ <code>object</code>
Init services.

**Kind**: inner method of [<code>LoraWanTransport</code>](#module_LoraWanTransport)  
**Returns**: <code>object</code> - conf  
**Emits**: <code>module:loraWanApp~event:init</code>, <code>module:mqttBridge~event:init</code>  

| Param | Type | Description |
| --- | --- | --- |
| conf | <code>object</code> | Formatted configuration |

<a name="module_cacheStore"></a>

## cacheStore
<a name="module_cacheStore.init"></a>

### cacheStore.init(conf)
**Kind**: static method of [<code>cacheStore</code>](#module_cacheStore)  

| Param | Type | Description |
| --- | --- | --- |
| conf | <code>object</code> | Formatted configuration |

<a name="module_fileStore"></a>

## fileStore
<a name="module_fileStore.init"></a>

### fileStore.init(conf)
**Kind**: static method of [<code>fileStore</code>](#module_fileStore)  

| Param | Type | Description |
| --- | --- | --- |
| conf | <code>object</code> | Formatted configuration |

<a name="module_loraWanApp"></a>

## loraWanApp

* [loraWanApp](#module_loraWanApp)
    * ["status" (state)](#module_loraWanApp..event_status)
    * ["error" (error)](#module_loraWanApp..event_error)
    * ["TX" (message)](#module_loraWanApp..event_TX)
    * ["RX" (message)](#module_loraWanApp..event_RX)
    * ["find" (model, [key])](#module_loraWanApp..event_find)
    * ["update" (model, [key])](#module_loraWanApp..event_update)
    * ["done" (server)](#module_loraWanApp..event_done) ⇒ <code>function</code>

<a name="module_loraWanApp..event_status"></a>

### "status" (state)
**Kind**: event emitted by [<code>loraWanApp</code>](#module_loraWanApp)  
**Emits**: <code>module:mqttBridge~event:publish</code>  

| Param | Type | Description |
| --- | --- | --- |
| state | <code>object</code> | status content. |

<a name="module_loraWanApp..event_error"></a>

### "error" (error)
**Kind**: event emitted by [<code>loraWanApp</code>](#module_loraWanApp)  

| Param | Type | Description |
| --- | --- | --- |
| error | <code>object</code> | error content. |

<a name="module_loraWanApp..event_TX"></a>

### "TX" (message)
**Kind**: event emitted by [<code>loraWanApp</code>](#module_loraWanApp)  
**Emits**: <code>module:mqttBridge~event:publish</code>  

| Param | Type | Description |
| --- | --- | --- |
| message | <code>object</code> | message content. |

<a name="module_loraWanApp..event_RX"></a>

### "RX" (message)
**Kind**: event emitted by [<code>loraWanApp</code>](#module_loraWanApp)  
**Emits**: <code>module:mqttBridge~event:publish</code>  

| Param | Type | Description |
| --- | --- | --- |
| message | <code>object</code> | message content. |

<a name="module_loraWanApp..event_find"></a>

### "find" (model, [key])
**Kind**: event emitted by [<code>loraWanApp</code>](#module_loraWanApp)  
**Emits**: <code>module:mqttBridge~event:publish</code>  

| Param | Type | Description |
| --- | --- | --- |
| model | <code>object</code> | model to update. |
| [key] | <code>string</code> | Instance/property to read |

<a name="module_loraWanApp..event_update"></a>

### "update" (model, [key])
**Kind**: event emitted by [<code>loraWanApp</code>](#module_loraWanApp)  
**Emits**: <code>module:loraWanApp~event:updated</code>  

| Param | Type | Description |
| --- | --- | --- |
| model | <code>object</code> | model to update. |
| [key] | <code>string</code> | Instance/property to read |

<a name="module_loraWanApp..event_done"></a>

### "done" (server) ⇒ <code>function</code>
**Kind**: event emitted by [<code>loraWanApp</code>](#module_loraWanApp)  
**Returns**: <code>function</code> - setLoraWanAppListeners  

| Param | Type | Description |
| --- | --- | --- |
| server | <code>object</code> | LoraWan server. |

<a name="module_mqttBridge"></a>

## mqttBridge

* [mqttBridge](#module_mqttBridge)
    * [~initApp(envVariables)](#module_mqttBridge..initApp)
    * ["status" (state)](#module_mqttBridge..event_status)
    * ["error" (error)](#module_mqttBridge..event_error)
    * ["message" (message)](#module_mqttBridge..event_message)
    * ["done" (client)](#module_mqttBridge..event_done) ⇒ <code>function</code>

<a name="module_mqttBridge..initApp"></a>

### mqttBridge~initApp(envVariables)
Init application.

**Kind**: inner method of [<code>mqttBridge</code>](#module_mqttBridge)  
**Emits**: <code>module:appConfig~event:init</code>  

| Param | Type | Description |
| --- | --- | --- |
| envVariables | <code>object</code> | Environement variables. |

<a name="module_mqttBridge..event_status"></a>

### "status" (state)
**Kind**: event emitted by [<code>mqttBridge</code>](#module_mqttBridge)  

| Param | Type | Description |
| --- | --- | --- |
| state | <code>object</code> | status content. |

<a name="module_mqttBridge..event_error"></a>

### "error" (error)
**Kind**: event emitted by [<code>mqttBridge</code>](#module_mqttBridge)  

| Param | Type | Description |
| --- | --- | --- |
| error | <code>object</code> | error content. |

<a name="module_mqttBridge..event_message"></a>

### "message" (message)
**Kind**: event emitted by [<code>mqttBridge</code>](#module_mqttBridge)  
**Emits**: <code>module:loraWanApp~event:message</code>  

| Param | Type | Description |
| --- | --- | --- |
| message | <code>object</code> | message content. |

<a name="module_mqttBridge..event_done"></a>

### "done" (client) ⇒ <code>function</code>
**Kind**: event emitted by [<code>mqttBridge</code>](#module_mqttBridge)  
**Returns**: <code>function</code> - setMqttBridgeListeners  

| Param | Type | Description |
| --- | --- | --- |
| client | <code>object</code> | MQTT client. |

<a name="result"></a>

## result : <code>object</code>
Parsed environment variables

**Kind**: global namespace  
<a name="state"></a>

## state : <code>object</code>
In memory nodes / sensors collection caching

**Kind**: global namespace  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| gateways | <code>object</code> | Lorawan Gateways state |
| nodes | <code>object</code> | Lorawan Devices state |

