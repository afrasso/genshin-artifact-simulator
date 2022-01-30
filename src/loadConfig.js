const config = require("../compiledData/config.json");

config.dropRates.domain.forEach((artifactDropRate) => {
  let rngMin = 0;
  artifactDropRate.dropCounts.forEach((dropCount) => {
    dropCount.rngMin = rngMin;
    dropCount.rngMax = rngMin + dropCount.chance;
    rngMin = dropCount.rngMax;
  });
});

module.exports = { config };
