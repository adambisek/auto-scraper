const fs = require ("fs");

const cacheFile = `${__dirname}/cache.js`;
let locked = false;

const read = () => {
  let cache = {}
  if (fs.existsSync(cacheFile)) {
    cache = JSON.parse(fs.readFileSync(cacheFile));
  }
  return cache
};

const markSended = (results) => {
  const cache = read()
  const sended = results.reduce((acc, result) => {
    return { ...acc, [result.link]: true }
  }, {})
  fs.writeFileSync(cacheFile, JSON.stringify({ ...cache, ...sended }, null, 2))
}

module.exports = {
  read,
  markSended
}
