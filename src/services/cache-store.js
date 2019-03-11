import redis from 'redis';
import {promisify} from 'util';
import logger from './logger';

/**
 * LoraWan Application Cache ( optional ), using redis.js
 * @namespace cacheStore
 */
export const cacheStore = {};

let redisClient;

/**
 * Find a model from CacheStorage
 * @param {string} model - Model to access in the cache
 * @param {string} [id] - Model Id
 * @returns {object} cacheValue
 */
cacheStore.find = async (model, id) => {
  try {
    logger.publish(4, 'cache-store', 'find:req', model);
    let cacheValue = {};
    if (id) {
      cacheValue = await redisClient.hgetAsync(model, id).then(res => {
        if (res && res !== null) return JSON.parse(res);
        return {};
      });
    } else {
      const rawCacheValue = await redisClient.hgetallAsync(model);
      if (!rawCacheValue || rawCacheValue === null) {
        return {};
      }
      const keys = Object.keys(rawCacheValue);
      await keys.forEach(key => {
        cacheValue[key] = JSON.parse(rawCacheValue[key]);
        return cacheValue;
      });
    }
    logger.publish(4, 'cache-store', 'find:res', cacheValue);
    return cacheValue;
  } catch (error) {
    logger.publish(3, 'cache-store', 'find:err', error);
    throw error;
  }
};

/**
 * Update CacheStorage collections
 * @param {string} model - Model to update
 * @param {object} content - Parsed JSON received from LoraWAN App
 * @param {string} [id] - Model Id
 * @returns {string} cacheValue
 * @throws Will throw an error if the message.data is null.
 */
cacheStore.update = async (model, content, id) => {
  try {
    logger.publish(3, 'cache-store', 'update:req', {model, content});
    let cacheValue;
    const cacheExpire = 120;
    if (id) {
      // cacheKey = `${model}-${Buffer.from(
      //   `${JSON.stringify({id})}`,
      //   'utf-8',
      // ).toString('base64')}`;
      cacheValue = JSON.stringify(content);
      await redisClient.hsetAsync(model, id, cacheValue);
      await redisClient.expireAsync(model, cacheExpire);
    } else {
      const keys = Object.keys(content);
      await keys.forEach(key => {
        cacheValue[key] = JSON.stringify(content[key]);
        return cacheValue;
      });
      await redisClient.hmsetAsync(model, cacheValue);
      await redisClient.expireAsync(model, cacheExpire);
    }
    return cacheValue;
  } catch (error) {
    logger.publish(3, 'cache-store', 'update:err', error);
    throw error;
  }
};

/**
 * Delete model from CacheStorage
 * @param {string} model - Model to delete
 * @param {string} [id] - Model Id
 * @returns {string} cacheKey
 * @throws Will throw an error if the message.data is null.
 */
cacheStore.delete = async (model, id) => {
  try {
    logger.publish(3, 'cache-store', 'delete:req', model);
    let cacheValue;
    if (id) {
      // cacheKey = `${model}-${Buffer.from(
      //   `${JSON.stringify({id})}`,
      //   'utf-8',
      // ).toString('base64')}`;
      cacheValue = await redisClient.hgetAsync(model, id);
      if (cacheValue && cacheValue !== null) {
        await redisClient.hdelAsync(model, id);
      }
    } else {
      cacheValue = await redisClient.hgetAllAsync(model);
      if (cacheValue && cacheValue !== null) {
        const keys = await redisClient.hkeysAsync(model);
        await redisClient.hdelAsync(model, keys);
      }
    }

    return cacheValue;
  } catch (error) {
    logger.publish(3, 'cache-store', 'delete:err', error);
    throw error;
  }
};

/**
 * Init CacheStore
 * @param {object} conf - Formatted configuration
 * @param {string} config.redis.host - Host for redis storage.
 * @param {number} config.redis.port - Port for redis storage.
 * @param {string} config.redis.db - Collection for redis storage.
 * @returns {object} redisClient
 */
cacheStore.init = conf => {
  logger.publish(3, 'cache-store', 'init:req', conf.redis);
  /**
   * Redis Client.
   * @module redisClient
   */
  redisClient = redis.createClient({
    host: conf.redis.host,
    port: conf.redis.port,
    db: conf.redis.db,
  });
  if (conf.redis.password) {
    redisClient.auth(conf.redis.password, err => {
      if (err) throw err;
    });
  }

  /**
   * @method module:redisClient.hgetAsync
   * @params {string} model - Cache reference
   * @params {string} [id] - Cache model Id
   */
  redisClient.hgetAsync = promisify(redisClient.hget).bind(redisClient);

  /**
   * @method module:redisClient.hsetAsync
   * @params {string} model - Cache reference
   * @params {object} content - Object to save
   * @params {string} [id] - Cache model Id
   */
  redisClient.hsetAsync = promisify(redisClient.hset).bind(redisClient);

  /**
   * @method module:redisClient.hgetallAsync
   * @params {string} model - Cache reference
   */
  redisClient.hgetallAsync = promisify(redisClient.hgetall).bind(redisClient);

  /**
   * @method module:redisClient.hmsetAsync
   * @params {string} model - Cache reference
   * @params {object} content - Object to save
   */
  redisClient.hmsetAsync = promisify(redisClient.hmset).bind(redisClient);

  /**
   * @method module:redisClient.hkeysAsync
   * @params {string} model - Cache reference
   */
  redisClient.hkeysAsync = promisify(redisClient.hkeys).bind(redisClient);
  /**
   * @method module:redisClient.expireAsync
   * @params {string} model - Cache reference
   * @params {number} value - Expiration time
   */
  redisClient.expireAsync = promisify(redisClient.expire).bind(redisClient);
  // redisClient.ttlAsync = promisify(redisClient.ttl).bind(redisClient);

  /**
   * @event module:redisClient~error
   * @param {object} error - Redis Client error
   */
  redisClient.on('error', err => {
    if (err && err.message) {
      logger.publish(3, 'cache-store', 'onError', err.message);
    }
  });
  return redisClient;
};
