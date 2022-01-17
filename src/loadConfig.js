const fs = require("fs");
const yaml = require("js-yaml");

const config = yaml.load(fs.readFileSync("./data/config.yaml"));

config.dropRates.domain.forEach((artifactDropRate) => {
  let rngMin = 0;
  artifactDropRate.dropCounts.forEach((dropCount) => {
    dropCount.rngMin = rngMin;
    dropCount.rngMax = rngMin + dropCount.chance;
    rngMin = dropCount.rngMax;
  });
});

module.exports = { config };
