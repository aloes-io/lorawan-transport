## Modules

<dl>
<dt><a href="#module_LoraWanServer">LoraWanServer</a></dt>
<dd></dd>
<dt><a href="#module_UDPSocket">UDPSocket</a></dt>
<dd></dd>
<dt><a href="#module_UDPSocketUp">UDPSocketUp</a></dt>
<dd></dd>
<dt><a href="#module_UDPSocketDown">UDPSocketDown</a></dt>
<dd></dd>
</dl>

<a name="module_LoraWanServer"></a>

## LoraWanServer

* [LoraWanServer](#module_LoraWanServer)
    * _static_
        * [.pushAck(self, clientInfo, tokens, gateway)](#module_LoraWanServer.pushAck) ⇒ <code>function</code>
        * [.pullAck(self, clientInfo, tokens, gateway)](#module_LoraWanServer.pullAck) ⇒ <code>function</code>
        * [.socketDataToString(socketData)](#module_LoraWanServer.socketDataToString) ⇒ <code>object</code>
        * [.parseMessage(self, socketData, clientInfo)](#module_LoraWanServer.parseMessage) ⇒ <code>object</code>
        * [.setLoraWANListeners(self)](#module_LoraWanServer.setLoraWANListeners)
        * [.setUDPServer(self)](#module_LoraWanServer.setUDPServer)
    * _inner_
        * [~Server](#module_LoraWanServer..Server)
            * [.pullResp(txpk, tokens, clientInfo, gateway)](#module_LoraWanServer..Server+pullResp) ⇒ <code>function</code>
            * [.stop()](#module_LoraWanServer..Server+stop)
            * [.start()](#module_LoraWanServer..Server+start)

<a name="module_LoraWanServer.pushAck"></a>

### LoraWanServer.pushAck(self, clientInfo, tokens, gateway) ⇒ <code>function</code>
**Kind**: static method of [<code>LoraWanServer</code>](#module_LoraWanServer)  
**Returns**: <code>function</code> - Server.send()  

| Param | Type | Description |
| --- | --- | --- |
| self | <code>object</code> | Server instance. |
| clientInfo | <code>object</code> | UDP client config. |
| tokens | <code>object</code> | Gateway tokens. |
| gateway | <code>object</code> | Gateway instance. |

<a name="module_LoraWanServer.pullAck"></a>

### LoraWanServer.pullAck(self, clientInfo, tokens, gateway) ⇒ <code>function</code>
**Kind**: static method of [<code>LoraWanServer</code>](#module_LoraWanServer)  
**Returns**: <code>function</code> - Server.send()  

| Param | Type | Description |
| --- | --- | --- |
| self | <code>object</code> | Server instance. |
| clientInfo | <code>object</code> | UDP client config. |
| tokens | <code>object</code> | Gateway tokens. |
| gateway | <code>object</code> | Gateway instance. |

<a name="module_LoraWanServer.socketDataToString"></a>

### LoraWanServer.socketDataToString(socketData) ⇒ <code>object</code>
**Kind**: static method of [<code>LoraWanServer</code>](#module_LoraWanServer)  
**Returns**: <code>object</code> - parsedMessage  

| Param | Type | Description |
| --- | --- | --- |
| socketData | <code>object</code> | UDP message. |

<a name="module_LoraWanServer.parseMessage"></a>

### LoraWanServer.parseMessage(self, socketData, clientInfo) ⇒ <code>object</code>
**Kind**: static method of [<code>LoraWanServer</code>](#module_LoraWanServer)  
**Returns**: <code>object</code> - parsedMessage  

| Param | Type | Description |
| --- | --- | --- |
| self | <code>object</code> | Server instance. |
| socketData | <code>object</code> | UDP message. |
| clientInfo | <code>object</code> | UDP client config. |

<a name="module_LoraWanServer.setLoraWANListeners"></a>

### LoraWanServer.setLoraWANListeners(self)
**Kind**: static method of [<code>LoraWanServer</code>](#module_LoraWanServer)  

| Param | Type | Description |
| --- | --- | --- |
| self | <code>object</code> | Server instance. |

<a name="module_LoraWanServer.setUDPServer"></a>

### LoraWanServer.setUDPServer(self)
**Kind**: static method of [<code>LoraWanServer</code>](#module_LoraWanServer)  

| Param | Type | Description |
| --- | --- | --- |
| self | <code>object</code> | Server instance. |

<a name="module_LoraWanServer..Server"></a>

### LoraWanServer~Server
**Kind**: inner class of [<code>LoraWanServer</code>](#module_LoraWanServer)  

* [~Server](#module_LoraWanServer..Server)
    * [.pullResp(txpk, tokens, clientInfo, gateway)](#module_LoraWanServer..Server+pullResp) ⇒ <code>function</code>
    * [.stop()](#module_LoraWanServer..Server+stop)
    * [.start()](#module_LoraWanServer..Server+start)

<a name="module_LoraWanServer..Server+pullResp"></a>

#### server.pullResp(txpk, tokens, clientInfo, gateway) ⇒ <code>function</code>
**Kind**: instance method of [<code>Server</code>](#module_LoraWanServer..Server)  
**Returns**: <code>function</code> - Server.send()  

| Param | Type | Description |
| --- | --- | --- |
| txpk | <code>object</code> | LoraWAN full packet. |
| tokens | <code>object</code> | Gateway tokens. |
| clientInfo | <code>object</code> | UDP client config. |
| gateway | <code>object</code> | Gateway instance. |

<a name="module_LoraWanServer..Server+stop"></a>

#### server.stop()
**Kind**: instance method of [<code>Server</code>](#module_LoraWanServer..Server)  
<a name="module_LoraWanServer..Server+start"></a>

#### server.start()
**Kind**: instance method of [<code>Server</code>](#module_LoraWanServer..Server)  
<a name="module_UDPSocket"></a>

## UDPSocket

* [UDPSocket](#module_UDPSocket)
    * ["listening"](#module_UDPSocket..event_listening)
    * ["close"](#module_UDPSocket..event_close)
    * ["error"](#module_UDPSocket..event_error)
    * ["message"](#module_UDPSocket..event_message) ⇒ <code>functions</code>

<a name="module_UDPSocket..event_listening"></a>

### "listening"
**Kind**: event emitted by [<code>UDPSocket</code>](#module_UDPSocket)  
**Emits**: <code>module:loraWanServer~event:ready</code>  
<a name="module_UDPSocket..event_close"></a>

### "close"
**Kind**: event emitted by [<code>UDPSocket</code>](#module_UDPSocket)  
**Emits**: <code>module:loraWanServer~event:close</code>  
<a name="module_UDPSocket..event_error"></a>

### "error"
**Kind**: event emitted by [<code>UDPSocket</code>](#module_UDPSocket)  
**Emits**: <code>module:loraWanServer~event:error</code>  
<a name="module_UDPSocket..event_message"></a>

### "message" ⇒ <code>functions</code>
**Kind**: event emitted by [<code>UDPSocket</code>](#module_UDPSocket)  
**Returns**: <code>functions</code> - parseMessage  
<a name="module_UDPSocketUp"></a>

## UDPSocketUp

* [UDPSocketUp](#module_UDPSocketUp)
    * ["listening"](#module_UDPSocketUp..event_listening)
    * ["close"](#module_UDPSocketUp..event_close)
    * ["error"](#module_UDPSocketUp..event_error)
    * ["message"](#module_UDPSocketUp..event_message) ⇒ <code>functions</code>

<a name="module_UDPSocketUp..event_listening"></a>

### "listening"
**Kind**: event emitted by [<code>UDPSocketUp</code>](#module_UDPSocketUp)  
**Emits**: <code>module:loraWanServer~event:ready</code>  
<a name="module_UDPSocketUp..event_close"></a>

### "close"
**Kind**: event emitted by [<code>UDPSocketUp</code>](#module_UDPSocketUp)  
**Emits**: <code>module:loraWanServer~event:close</code>  
<a name="module_UDPSocketUp..event_error"></a>

### "error"
**Kind**: event emitted by [<code>UDPSocketUp</code>](#module_UDPSocketUp)  
**Emits**: <code>module:loraWanServer~event:error</code>  
<a name="module_UDPSocketUp..event_message"></a>

### "message" ⇒ <code>functions</code>
**Kind**: event emitted by [<code>UDPSocketUp</code>](#module_UDPSocketUp)  
**Returns**: <code>functions</code> - parseMessage  
<a name="module_UDPSocketDown"></a>

## UDPSocketDown

* [UDPSocketDown](#module_UDPSocketDown)
    * ["listening"](#module_UDPSocketDown..event_listening)
    * ["close"](#module_UDPSocketDown..event_close)
    * ["error"](#module_UDPSocketDown..event_error)
    * ["message"](#module_UDPSocketDown..event_message) ⇒ <code>functions</code>

<a name="module_UDPSocketDown..event_listening"></a>

### "listening"
**Kind**: event emitted by [<code>UDPSocketDown</code>](#module_UDPSocketDown)  
**Emits**: <code>module:loraWanServer~event:ready</code>  
<a name="module_UDPSocketDown..event_close"></a>

### "close"
**Kind**: event emitted by [<code>UDPSocketDown</code>](#module_UDPSocketDown)  
**Emits**: <code>module:loraWanServer~event:close</code>  
<a name="module_UDPSocketDown..event_error"></a>

### "error"
**Kind**: event emitted by [<code>UDPSocketDown</code>](#module_UDPSocketDown)  
**Emits**: <code>module:loraWanServer~event:error</code>  
<a name="module_UDPSocketDown..event_message"></a>

### "message" ⇒ <code>functions</code>
**Kind**: event emitted by [<code>UDPSocketDown</code>](#module_UDPSocketDown)  
**Returns**: <code>functions</code> - parseMessage  
