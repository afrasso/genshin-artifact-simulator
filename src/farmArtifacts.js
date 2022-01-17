const _ = require("lodash");
const { artifactTypes } = require("./loadArtifactTypes.js");
const { config } = require("./loadConfig.js");
const { bossArtifactSets, sets } = require("./loadSets.js");

const farmArtifacts = ({ set = _.head(sets) }) => {
  const dropRate = _.find(
    config.dropRates[set.source],
    (dropRate) => dropRate.stars === 5
  );
  let dropRng = Math.random();
  const dropNum = _.find(
    dropRate.dropCounts,
    (dropCount) => dropRng >= dropCount.rngMin && dropRng < dropCount.rngMax
  ).num;
  return {
    artifacts: _.times(dropNum, () => {
      const possibleSets =
        set.source === "domain" ? set.domain.sets : bossArtifactSets;
      return generateArtifact({
        setName:
          possibleSets[Math.floor(_.size(possibleSets) * Math.random())].name,
      });
    }),
    resinCost: set.source === "domain" ? 20 : 40,
  };
};

const generateArtifact = ({ setName }) => {
  const typeRng = Math.random();
  const statRng = Math.random();
  // const substatRng = Math.random();
  const type = _.find(
    artifactTypes,
    (type) => typeRng >= type.rngMin && typeRng < type.rngMax
  );
  const stat = _.find(
    type.stats,
    (stat) => statRng >= stat.rngMin && statRng < stat.rngMax
  );
  return { set: setName, type: type.name, stat: stat.name };
};

module.exports = farmArtifacts;
