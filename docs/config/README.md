<a name="module_appConfig"></a>

## appConfig

* [appConfig](#module_appConfig)
    * [~init(config)](#module_appConfig..init)
    * ["done" (config)](#module_appConfig..event_done)
    * ["init" (envVariables)](#module_appConfig..event_init)

<a name="module_appConfig..init"></a>

### appConfig~init(config)
Init Application config

**Kind**: inner method of [<code>appConfig</code>](#module_appConfig)  
**Emits**: [<code>done</code>](#module_appConfig..event_done)  

| Param | Type | Description |
| --- | --- | --- |
| config | <code>object</code> | Env variables |
| config.brokerUrl | <code>string</code> | MQTT Broker URL |
| config.mqtt | <code>object</code> | MQTT client config |
| config.lorawan | <code>object</code> | LoraWan server config |
| config.redis | <code>object</code> | Redis client config |
| config.fileStore | <code>object</code> | FS path config |
| [config.storage] | <code>string</code> | Storage type ( "inMemory", "inFile", "cacheStorage" ) |

<a name="module_appConfig..event_done"></a>

### "done" (config)
Event reporting that appConfig has done the job.

**Kind**: event emitted by [<code>appConfig</code>](#module_appConfig)  

| Param | Type | Description |
| --- | --- | --- |
| config | <code>object</code> | Configuration set by env variables. |

<a name="module_appConfig..event_init"></a>

### "init" (envVariables)
Event reporting that appConfig has to init.

**Kind**: event emitted by [<code>appConfig</code>](#module_appConfig)  

| Param | Type | Description |
| --- | --- | --- |
| envVariables | <code>object</code> | Environment variables. |

