const _ = require("lodash");
const fs = require("fs");
const yaml = require("js-yaml");
const { sets } = require("./loadSets.js");
const { artifactTypes } = require("./loadArtifactTypes.js");
const findMatchingArtifactsForCharacter = require("./findMatchingArtifactsForCharacter.js");
const logCharacter = require("./logCharacter.js");
const artifactMatchesCriteria = require("./artifactMatchesCriteria.js");

// const otherData = fs.readFileSync("./data/other.yaml");
// const { artifactXp, fourSubstatsChance, dropRates } = yaml.load(otherData);

const charactersData = fs.readFileSync("./data/characters.yaml");
const characters = yaml.load(charactersData);

const artifactsData = fs.readFileSync("./data/artifacts.yaml");
const artifacts = yaml.load(artifactsData);

const farmForArtifacts = ({ dropRates, sourceType, domain }) => {
  const dropRate = _.find(dropRates[sourceType], (dr) => dr.stars === 5);
  const drops =
    Math.random() < _.head(dropRate.drops)
      ? _.head(dropRate.drops)
      : _.head(_.tail(dropRate.drops));
  return _.times(
    drops.num,
    generateArtifact({
      set:
        Math.random() < 0.5 ? _.head(domain.sets) : _.head(_.tail(domain.sets)),
      artifactDropRates: dropRate,
    })
  );
};

const generateArtifact = ({ set, artifactDropRates }) => {
  const typeRng = Math.random();
  const statRng = Math.random();
  // const substatRng = Math.random();
  const type = _.find(
    artifactDropRates.types,
    (type) => typeRng >= type.rngMin && typeRng < type.rngMax
  );
  const stat = _.find(
    type.stats,
    (stat) => statRng >= stat.rngMin && statRng < stat.rngMax
  );
  return { set, type: type.name, stat: stat.name };
};

characters.forEach((character) => {
  const matchingArtifacts = findMatchingArtifactsForCharacter({
    character,
    artifacts,
  });
  logCharacter({ character, matchingArtifacts });
});

characters.forEach((character) => {
  const matchingArtifacts = findMatchingArtifactsForCharacter({
    character,
    artifacts,
  });
  if (
    _.filter(
      matchingArtifacts.artifacts,
      (artifact) => artifact.set === character.set1
    ).length < 2
  ) {
    const artifactCriteria = _.head(matchingArtifacts.missingArtifactsCriteria);
    const set = _.find(sets, character.set1);
    let newArtifacts = [];
    let cumulativeNewArtifacts = [];
    while (
      _.find(newArtifacts, (artifact) =>
        artifactMatchesCriteria({ artifact, artifactCriteria })
      )
    ) {
      newArtifacts = farmForArtifacts({
        artifactCriteria: _.head(matchingArtifacts.missingArtifactsCriteria),
        sourceType: set.sourceType,
        source: set.source,
      });
      cumulativeNewArtifacts.push(...newArtifacts);
    }
    const newMatchingArtifacts = findMatchingArtifactsForCharacter({
      character,
      artifacts: [...artifacts, ...cumulativeNewArtifacts],
    });

    console.log(`For ${character.name}:`);
    console.log("  Found the following artifacts:");
    newMatchingArtifacts.artifacts.forEach((artifact) => {
      console.log(`    ${JSON.stringify(artifact)}`);
    });
    console.log("  Need the following artifacts:");
    newMatchingArtifacts.missingArtifactsCriteria.forEach((criteria) => {
      console.log(`    ${JSON.stringify(criteria)}`);
    });
    newMatchingArtifacts.artifacts.forEach((artifact) => {
      artifact.owner = character.name;
    });
  }
});
