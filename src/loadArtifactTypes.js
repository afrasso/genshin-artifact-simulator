const artifactTypes = require("../compiledData/artifactTypes.json");

let typeRngMin = 0;
artifactTypes.forEach((type) => {
  type.rngMin = typeRngMin;
  type.rngMax = typeRngMin + type.chance;
  let statRngMin = 0;
  type.stats.forEach((stat) => {
    stat.rngMin = statRngMin;
    stat.rngMax = statRngMin + stat.chance;
    let substatRngMin = 0;
    stat.substats.forEach((substat) => {
      substat.rngMin = substatRngMin;
      substat.rngMax = substatRngMin + substat.chance;
      substatRngMin = substat.rngMax;
    });
    statRngMin = stat.rngMax;
  });
  typeRngMin = type.rngMax;
});

module.exports = { artifactTypes };
