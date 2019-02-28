## Objects

<dl>
<dt><a href="#protocolRef">protocolRef</a> : <code>object</code></dt>
<dd><p>References used to validate payloads</p>
</dd>
</dl>

## External

<dl>
<dt><a href="#external_OmaObjects">OmaObjects</a></dt>
<dd><p>Oma Object References.</p>
</dd>
<dt><a href="#external_OmaResources">OmaResources</a></dt>
<dd><p>Oma Resources References.</p>
</dd>
</dl>

<a name="protocolRef"></a>

## protocolRef : <code>object</code>
References used to validate payloads

**Kind**: global namespace  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| internalPattern | <code>string</code> | The pattern used by LoraWAN controller. |
| externalPattern | <code>string</code> | The pattern used by MQTT bridge. |
| validators | <code>object</code> | Check inputs / build outputs |
| validators.mTypes | <code>array</code> | Used by LoraWAN Stack. |
| validators.types | <code>array</code> | Used by LoraWAN Stack. |
| validators.collectionNames | <code>array</code> | Used to build AloesClient packet. |
| validators.methods | <code>array</code> | Used to build AloesClient packet. |

<a name="external_OmaObjects"></a>

## OmaObjects
Oma Object References.

**Kind**: global external  
**See**: [https://api.aloes.io/api/omaObjects](https://api.aloes.io/api/omaObjects)  
<a name="external_OmaResources"></a>

## OmaResources
Oma Resources References.

**Kind**: global external  
**See**: [https://api.aloes.io/api/omaResources](https://api.aloes.io/api/omaResources)  
