## Modules

<dl>
<dt><a href="#module_redisClient">redisClient</a></dt>
<dd><p>Redis Client.</p>
</dd>
</dl>

## Objects

<dl>
<dt><a href="#cacheStore">cacheStore</a> : <code>object</code></dt>
<dd><p>LoraWan Application Cache ( optional ), using redis.js</p>
</dd>
</dl>

<a name="module_redisClient"></a>

## redisClient
Redis Client.


* [redisClient](#module_redisClient)
    * _static_
        * [.hgetAsync()](#module_redisClient.hgetAsync)
        * [.hsetAsync()](#module_redisClient.hsetAsync)
        * [.hgetallAsync()](#module_redisClient.hgetallAsync)
        * [.hmsetAsync()](#module_redisClient.hmsetAsync)
        * [.hkeysAsync()](#module_redisClient.hkeysAsync)
        * [.expireAsync()](#module_redisClient.expireAsync)
    * _inner_
        * ["error" (error)](#module_redisClient..event_error)

<a name="module_redisClient.hgetAsync"></a>

### redisClient.hgetAsync()
**Kind**: static method of [<code>redisClient</code>](#module_redisClient)  
**Params**: <code>string</code> model - Cache reference  
**Params**: <code>string</code> [id] - Cache model Id  
<a name="module_redisClient.hsetAsync"></a>

### redisClient.hsetAsync()
**Kind**: static method of [<code>redisClient</code>](#module_redisClient)  
**Params**: <code>string</code> model - Cache reference  
**Params**: <code>object</code> content - Object to save  
**Params**: <code>string</code> [id] - Cache model Id  
<a name="module_redisClient.hgetallAsync"></a>

### redisClient.hgetallAsync()
**Kind**: static method of [<code>redisClient</code>](#module_redisClient)  
**Params**: <code>string</code> model - Cache reference  
<a name="module_redisClient.hmsetAsync"></a>

### redisClient.hmsetAsync()
**Kind**: static method of [<code>redisClient</code>](#module_redisClient)  
**Params**: <code>string</code> model - Cache reference  
**Params**: <code>object</code> content - Object to save  
<a name="module_redisClient.hkeysAsync"></a>

### redisClient.hkeysAsync()
**Kind**: static method of [<code>redisClient</code>](#module_redisClient)  
**Params**: <code>string</code> model - Cache reference  
<a name="module_redisClient.expireAsync"></a>

### redisClient.expireAsync()
**Kind**: static method of [<code>redisClient</code>](#module_redisClient)  
**Params**: <code>string</code> model - Cache reference  
**Params**: <code>number</code> value - Expiration time  
<a name="module_redisClient..event_error"></a>

### "error" (error)
**Kind**: event emitted by [<code>redisClient</code>](#module_redisClient)  

| Param | Type | Description |
| --- | --- | --- |
| error | <code>object</code> | Redis Client error |

<a name="cacheStore"></a>

## cacheStore : <code>object</code>
LoraWan Application Cache ( optional ), using redis.js

**Kind**: global namespace  

* [cacheStore](#cacheStore) : <code>object</code>
    * [.find(model, [id])](#cacheStore.find) ⇒ <code>object</code>
    * [.update(model, content, [id])](#cacheStore.update) ⇒ <code>string</code>
    * [.delete(model, [id])](#cacheStore.delete) ⇒ <code>string</code>
    * [.init(conf)](#cacheStore.init) ⇒ <code>object</code>

<a name="cacheStore.find"></a>

### cacheStore.find(model, [id]) ⇒ <code>object</code>
Find a model from CacheStorage

**Kind**: static method of [<code>cacheStore</code>](#cacheStore)  
**Returns**: <code>object</code> - cacheValue  

| Param | Type | Description |
| --- | --- | --- |
| model | <code>string</code> | Model to access in the cache |
| [id] | <code>string</code> | Model Id |

<a name="cacheStore.update"></a>

### cacheStore.update(model, content, [id]) ⇒ <code>string</code>
Update CacheStorage collections

**Kind**: static method of [<code>cacheStore</code>](#cacheStore)  
**Returns**: <code>string</code> - cacheValue  
**Throws**:

- Will throw an error if the message.data is null.


| Param | Type | Description |
| --- | --- | --- |
| model | <code>string</code> | Model to update |
| content | <code>object</code> | Parsed JSON received from LoraWAN App |
| [id] | <code>string</code> | Model Id |

<a name="cacheStore.delete"></a>

### cacheStore.delete(model, [id]) ⇒ <code>string</code>
Delete model from CacheStorage

**Kind**: static method of [<code>cacheStore</code>](#cacheStore)  
**Returns**: <code>string</code> - cacheKey  
**Throws**:

- Will throw an error if the message.data is null.


| Param | Type | Description |
| --- | --- | --- |
| model | <code>string</code> | Model to delete |
| [id] | <code>string</code> | Model Id |

<a name="cacheStore.init"></a>

### cacheStore.init(conf) ⇒ <code>object</code>
Init CacheStore

**Kind**: static method of [<code>cacheStore</code>](#cacheStore)  
**Returns**: <code>object</code> - redisClient  

| Param | Type | Description |
| --- | --- | --- |
| conf | <code>object</code> | Formatted configuration |
| config.redis.host | <code>string</code> | Host for redis storage. |
| config.redis.port | <code>number</code> | Port for redis storage. |
| config.redis.db | <code>string</code> | Collection for redis storage. |

