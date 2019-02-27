## Modules

<dl>
<dt><a href="#module_LoraWanTransport">LoraWanTransport</a></dt>
<dd></dd>
<dt><a href="#module_loraWanApp">loraWanApp</a></dt>
<dd></dd>
<dt><a href="#module_mqttBridge">mqttBridge</a></dt>
<dd></dd>
</dl>

<a name="module_LoraWanTransport"></a>

## LoraWanTransport

* [LoraWanTransport](#module_LoraWanTransport)
    * [~testRXDevAddr(message)](#module_LoraWanTransport..testRXDevAddr)
    * [~testRXDevEui(message)](#module_LoraWanTransport..testRXDevEui)
    * [~setListeners()](#module_LoraWanTransport..setListeners)
    * [~initApp(envVariables)](#module_LoraWanTransport..initApp)

<a name="module_LoraWanTransport..testRXDevAddr"></a>

### LoraWanTransport~testRXDevAddr(message)
Mock reception of LoraPacket containing DevAddr

**Kind**: inner method of [<code>LoraWanTransport</code>](#module_LoraWanTransport)  
**Emits**: <code>module:loraWanApp~event:message</code>  

| Param | Type | Description |
| --- | --- | --- |
| message | <code>object</code> | message variables. |

<a name="module_LoraWanTransport..testRXDevEui"></a>

### LoraWanTransport~testRXDevEui(message)
Mock reception of LoraPacket containing DevEUI

**Kind**: inner method of [<code>LoraWanTransport</code>](#module_LoraWanTransport)  
**Emits**: <code>module:loraWanApp~event:message</code>  

| Param | Type | Description |
| --- | --- | --- |
| message | <code>object</code> | message content. |

<a name="module_LoraWanTransport..setListeners"></a>

### LoraWanTransport~setListeners()
**Kind**: inner method of [<code>LoraWanTransport</code>](#module_LoraWanTransport)  
<a name="module_LoraWanTransport..initApp"></a>

### LoraWanTransport~initApp(envVariables)
Init application.

**Kind**: inner method of [<code>LoraWanTransport</code>](#module_LoraWanTransport)  
**Emits**: <code>module:appConfig~event:init</code>  

| Param | Type | Description |
| --- | --- | --- |
| envVariables | <code>object</code> | Environement variables. |

<a name="module_loraWanApp"></a>

## loraWanApp

* [loraWanApp](#module_loraWanApp)
    * ["status" (state)](#module_loraWanApp..event_status)
    * ["error" (error)](#module_loraWanApp..event_error)
    * ["TX" (message)](#module_loraWanApp..event_TX)
    * ["RX" (message)](#module_loraWanApp..event_RX)

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

<a name="module_mqttBridge"></a>

## mqttBridge

* [mqttBridge](#module_mqttBridge)
    * ["status" (state)](#module_mqttBridge..event_status)
    * ["error" (error)](#module_mqttBridge..event_error)
    * ["message" (message)](#module_mqttBridge..event_message)

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

