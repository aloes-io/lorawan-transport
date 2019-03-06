<a name="fileStore"></a>

## fileStore : <code>object</code>
LoraWan Application File Store, ( optional ) using filesystem

**Kind**: global namespace  

* [fileStore](#fileStore) : <code>object</code>
    * [.find(model, [id])](#fileStore.find) ⇒ <code>object</code>
    * [.update(model, content, [id])](#fileStore.update) ⇒ <code>string</code>
    * [.init(conf)](#fileStore.init) ⇒ <code>object</code>

<a name="fileStore.find"></a>

### fileStore.find(model, [id]) ⇒ <code>object</code>
Find a model from fileStorage

**Kind**: static method of [<code>fileStore</code>](#fileStore)  
**Returns**: <code>object</code> - collection  

| Param | Type | Description |
| --- | --- | --- |
| model | <code>string</code> | Model to access in the cache |
| [id] | <code>string</code> | Model Id |

<a name="fileStore.update"></a>

### fileStore.update(model, content, [id]) ⇒ <code>string</code>
Update fileStorage collection

**Kind**: static method of [<code>fileStore</code>](#fileStore)  
**Returns**: <code>string</code> - path  
**Throws**:

- Will throw an error if the message.data is null.


| Param | Type | Description |
| --- | --- | --- |
| model | <code>string</code> | Model to update |
| content | <code>object</code> | Parsed JSON received from LoraWAN App |
| [id] | <code>string</code> | Model Id |

<a name="fileStore.init"></a>

### fileStore.init(conf) ⇒ <code>object</code>
Init fileStorage

**Kind**: static method of [<code>fileStore</code>](#fileStore)  
**Returns**: <code>object</code> - storePaths  

| Param | Type | Description |
| --- | --- | --- |
| conf | <code>object</code> | Formatted configuration |
| conf.fileStore.gateways | <code>string</code> | Host for redis storage. |
| conf.fileStore.nodes | <code>string</code> | Port for redis storage. |

