const _ = require("lodash");
const fs = require("fs");
const yaml = require("js-yaml");
const { sets } = require("./loadSets.js");
const { artifactTypes } = require("./loadArtifactTypes.js");

// const otherData = fs.readFileSync("./data/other.yaml");
// const { artifactXp, fourSubstatsChance, dropRates } = yaml.load(otherData);

const charactersData = fs.readFileSync("./data/characters.yaml");
const characters = yaml.load(charactersData);

const artifactsData = fs.readFileSync("./data/artifacts.yaml");
const artifacts = yaml.load(artifactsData);

const findMatchingArtifactsForCharacter = ({ character, artifacts }) => {
  character.artifactCriteria.forEach((artifactCriteria) => {
    artifactCriteria.difficulty =
      rateArtifactCriteriaDifficulty(artifactCriteria);
  });
  return findRemainingArtifacts({
    artifacts: _.filter(artifacts, (artifact) => !artifact.owner),
    artifactCriteria: character.artifactCriteria,
    set1: character.set1,
    set2: character.set2,
  });
};

const rateArtifactCriteriaDifficulty = () => {
  return 0.5;
};

const findRemainingArtifacts = ({
  artifacts,
  artifactCriteria,
  set1,
  set1Count = 0,
  set2,
  set2Count = 0,
  noSetCount = 0,
}) => {
  if (artifactCriteria.length === 0) {
    return { artifacts: [], missingArtifactsCriteria: [] };
  }
  const choices = [];
  const currentArtifactCriteria = _.head(artifactCriteria);
  const remainingArtifactCriteria = _.tail(artifactCriteria);
  if (set1Count < 4 || (set1Count < 2 && set2)) {
    const artifact = findArtifactByCriteria({
      artifacts,
      artifactCriteria: currentArtifactCriteria,
      set: set1,
    });
    const remainingArtifacts = findRemainingArtifacts({
      artifacts,
      artifactCriteria: remainingArtifactCriteria,
      set1,
      set1Count: set1Count + 1,
      set2,
      set2Count,
      noSetCount,
    });
    if (!artifact) {
      choices.push({
        artifacts: remainingArtifacts.artifacts,
        missingArtifactsCriteria: [
          currentArtifactCriteria,
          ...remainingArtifacts.missingArtifactsCriteria,
        ],
      });
    } else {
      choices.push({
        artifacts: [artifact, ...remainingArtifacts.artifacts],
        missingArtifactsCriteria: remainingArtifacts.missingArtifactsCriteria,
      });
    }
  }
  if (set2 && set2Count < 2) {
    const artifact = findArtifactByCriteria({
      artifacts,
      artifactCriteria: currentArtifactCriteria,
      set: set2,
    });
    const remainingArtifacts = findRemainingArtifacts({
      artifacts,
      artifactCriteria: remainingArtifactCriteria,
      set1,
      set1Count,
      set2,
      set2Count: set2Count + 1,
      noSetCount,
    });
    if (!artifact) {
      choices.push({
        artifacts: remainingArtifacts.artifacts,
        missingArtifactsCriteria: [
          currentArtifactCriteria,
          ...remainingArtifacts.missingArtifactsCriteria,
        ],
      });
    } else {
      choices.push({
        artifacts: [artifact, ...remainingArtifacts.artifacts],
        missingArtifactsCriteria: remainingArtifacts.missingArtifactsCriteria,
      });
    }
  }
  if (
    noSetCount === 0 &&
    ((set1Count === 2 && set2Count === 2) || set1Count === 4)
  ) {
    const artifact = findArtifactByCriteria({
      artifacts,
      artifactCriteria: currentArtifactCriteria,
    });
    const remainingArtifacts = findRemainingArtifacts({
      artifacts,
      artifactCriteria: remainingArtifactCriteria,
      set1,
      set1Count,
      set2,
      set2Count,
      noSetCount: noSetCount + 1,
    });
    if (!artifact) {
      choices.push({
        artifacts: remainingArtifacts.artifacts,
        missingArtifactsCriteria: [
          currentArtifactCriteria,
          ...remainingArtifacts.missingArtifactsCriteria,
        ],
      });
    } else {
      choices.push({
        artifacts: [artifact, ...remainingArtifacts.artifacts],
        missingArtifactsCriteria: remainingArtifacts.missingArtifactsCriteria,
      });
    }
  }
  return _.minBy(choices, (choice) =>
    _.sumBy(choice.missingArtifactsCriteria, (criteria) => criteria.difficulty)
  );
};

const findArtifactByCriteria = ({ artifacts, artifactCriteria, set }) => {
  return _.find(artifacts, (artifact) => {
    if (set && set !== artifact.set) {
      return false;
    }
    if (artifactCriteria.type && artifactCriteria.type !== artifact.type) {
      return false;
    }
    if (artifactCriteria.stat && artifactCriteria.stat !== artifact.stat) {
      return false;
    }
    if (artifactCriteria.substats) {
      artifactCriteria.substats.forEach((substat) => {
        if (!_.includes(artifact.substats, substat)) {
          return false;
        }
      });
    }
    return true;
  });
};

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
  console.log(`For ${character.name}:`);
  console.log("  Found the following artifacts:");
  matchingArtifacts.artifacts.forEach((artifact) => {
    console.log(`    ${JSON.stringify(artifact)}`);
  });
  console.log("  Need the following artifacts:");
  matchingArtifacts.missingArtifactsCriteria.forEach((criteria) => {
    console.log(`    ${JSON.stringify(criteria)}`);
  });
  matchingArtifacts.artifacts.forEach((artifact) => {
    artifact.owner = character.name;
  });
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
      findArtifactByCriteria({ artifacts: newArtifacts, artifactCriteria })
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
