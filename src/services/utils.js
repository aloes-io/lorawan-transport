import crypto from 'crypto';

const utils = {};

utils.randU32Sync = num => crypto.randomBytes(num).readUInt32BE(0, true);

utils.getRandomBytes = num => {
  const min = 0;
  const max = 255;
  //  const buffRandom = new Buffer(num);
  const buffRandom = Buffer.alloc(num);
  for (let i = min; i < num; i += 1) {
    buffRandom[i] = Math.random() * (max - min) + min;
  }
  return buffRandom;
};

utils.getRandomNumber = digits =>
  Math.floor(
    Math.random() * parseInt(`8${'9'.repeat(digits - 1)}`, 10) +
      parseInt(`1${'0'.repeat(digits - 1)}`, 10),
  );

module.exports = utils;
