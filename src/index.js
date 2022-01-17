const _ = require("lodash");
const fs = require("fs");
const yaml = require("js-yaml");

const { sets } = require("./loadSets.js");

const artifactMatchesCriteria = require("./artifactMatchesCriteria.js");
const farmArtifacts = require("./farmArtifacts.js");
const findMatchingArtifactsForCharacter = require("./findMatchingArtifactsForCharacter.js");
const logCharacter = require("./logCharacter.js");

const charactersData = fs.readFileSync("./data/characters.yaml");
const characters = yaml.load(charactersData);

characters.forEach((character) => {
  character.set1 = _.find(sets, (set) => set.name === character.set1);
  if (character.set2) {
    character.set2 = _.find(sets, (set) => set.name === character.set2);
  }
});

const artifactsData = fs.readFileSync("./data/artifacts.yaml");
const artifacts = yaml.load(artifactsData);

characters.forEach((character) => {
  const matchingArtifacts = findMatchingArtifactsForCharacter({
    character,
    artifacts,
  });
  logCharacter({ character, matchingArtifacts });
});

characters.forEach((character) => {
  console.log(`Working on ${character.name}!`);
  let matchingArtifacts;
  let totalResinSpent = 0;
  while (_.size(character.artifacts) < 5) {
    const artifactCriteria = _.head(character.missingArtifactsCriteria);
    if (
      artifactCriteria.stat === "HP%" &&
      (artifactCriteria.type === "feather" ||
        artifactCriteria.type === "flower")
    ) {
      console.log("WTF");
    }
    const set1ArtifactCount = _.filter(
      character.artifacts,
      (artifact) => artifact.set === character.set1.name
    ).length;
    const set2ArtifactCount = character.set2
      ? _.filter(
          character.artifacts,
          (artifact) => artifact.set === character.set2.name
        ).length
      : 0;
    let set;
    if (
      (_.isUndefined(character.set2) && set1ArtifactCount < 4) ||
      set1ArtifactCount < 2
    ) {
      set = character.set1;
    } else if (!_.isUndefined(character.set2) && set2ArtifactCount < 2) {
      set = character.set2;
    }
    let newArtifacts = [];
    let cumulativeNewArtifacts = [];
    while (
      _.isEmpty(
        _.intersectionWith(
          newArtifacts,
          character.missingArtifactsCriteria,
          (artifact, artifactCriteria) =>
            artifactMatchesCriteria({ artifact, artifactCriteria, set })
        )
      )
    ) {
      const results = farmArtifacts({ set });
      newArtifacts = results.artifacts;
      totalResinSpent += results.resinCost;
      cumulativeNewArtifacts.push(...newArtifacts);
      // if (totalResinSpent % 1000 === 0) {
      //   console.log("1K more resin spent!");
      // }
      // if (totalResinSpent % 100000 === 0) {
      //   console.log("uh oh");
      // }
    }
    artifacts.push(...cumulativeNewArtifacts);
    // console.log("Pre-matching artifacts");
    // console.log(character.artifacts);
    // console.log(character.missingArtifactsCriteria);
    matchingArtifacts = findMatchingArtifactsForCharacter({
      character,
      artifacts,
    });
    // console.log("Post-matching artifacts");
    // console.log(character.artifacts);
    // console.log(character.missingArtifactsCriteria);
    // console.log("just here for the shits");
  }
  console.log(`${totalResinSpent} spent.`);
  logCharacter({ character, matchingArtifacts });
});
