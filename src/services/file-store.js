import fs from 'fs';

/**
 * LoraWan Application File Store, ( optional ) using filesystem
 * @namespace fileStore
 */
export const fileStore = {};

const storePaths = {
  nodes: null,
  gateways: null,
};

const findFile = path =>
  new Promise((resolve, reject) => {
    fs.readFile(path, 'utf-8', (err, data) => {
      if (err && err !== null) {
        reject(err);
      } else if (!data || data === null) {
        resolve([]);
      }
      resolve(JSON.parse(data));
    });
  });

/**
 * Find a model from fileStorage
 * @param {string} model - Model to access in the cache
 * @param {string} [id] - Model Id
 * @returns {object} collection
 */
fileStore.find = async model => {
  try {
    const path = storePaths[model];
    if (!path || path === null) return new Error("Error : Path doesn't exist");
    const storedValue = await findFile(path);
    return storedValue;
  } catch (error) {
    //  return [];
    throw error;
  }
};

const updateFile = (path, content) =>
  new Promise((resolve, reject) => {
    fs.writeFile(path, JSON.stringify(content, null, 4), (err, data) => {
      if (err && err !== null) {
        reject(err);
      } else if (!data || data === null) {
        resolve([]);
      }
      resolve(data);
    });
  });

/**
 * Update fileStorage collection
 * @param {string} model - Model to update
 * @param {object} content - Parsed JSON received from LoraWAN App
 * @param {string} [id] - Model Id
 * @returns {string} path
 * @throws Will throw an error if the message.data is null.
 */
fileStore.update = async (model, content) => {
  try {
    const path = storePaths[model];
    if (!path || path === null) return new Error("Error : Path doesn't exist");
    const storedValue = await updateFile(path, content);
    return storedValue;
  } catch (error) {
    throw error;
  }
};

/**
 * Init fileStorage
 * @param {object} conf - Formatted configuration
 * @param {string} conf.fileStore.gateways - Host for redis storage.
 * @param {string} conf.fileStore.nodes - Port for redis storage.
 * @returns {object} storePaths
 */
fileStore.init = conf => {
  storePaths.gateways = conf.fileStore.gateways;
  storePaths.nodes = conf.fileStore.nodes;
  return storePaths;
};
