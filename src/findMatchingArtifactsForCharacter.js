const _ = require("lodash");
const artifactMatchesCriteria = require("./artifactMatchesCriteria.js");

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
  tab = "",
  includeNoSet = false,
}) => {
  // console.log(`${tab}Remaining Criteria: ${JSON.stringify(artifactCriteria)}`);
  if (artifactCriteria.length === 0) {
    return { artifacts: [], missingArtifactsCriteria: [] };
  }
  const choices = [];
  const currentArtifactCriteria = _.head(artifactCriteria);
  const remainingArtifactCriteria = _.tail(artifactCriteria);
  if (set1Count < 2 || (!set2 && set1Count < 4)) {
    const artifact = _.find(artifacts, (artifact) =>
      artifactMatchesCriteria({
        artifact,
        artifactCriteria: currentArtifactCriteria,
        set: set1,
      })
    );
    const remainingArtifacts = findRemainingArtifacts({
      artifacts,
      artifactCriteria: remainingArtifactCriteria,
      set1,
      set1Count: artifact ? set1Count + 1 : set1Count,
      set2,
      set2Count,
      noSetCount,
      tab: `${tab}  `,
      includeNoSet,
    });
    let choice;
    if (!artifact) {
      choice = {
        artifacts: remainingArtifacts.artifacts,
        missingArtifactsCriteria: [
          currentArtifactCriteria,
          ...remainingArtifacts.missingArtifactsCriteria,
        ],
      };
    } else {
      choice = {
        artifacts: [artifact, ...remainingArtifacts.artifacts],
        missingArtifactsCriteria: remainingArtifacts.missingArtifactsCriteria,
      };
    }
    // console.log(`${tab}Set 1 Choice: ${JSON.stringify(choice)}`);
    choices.push(choice);
  }
  if (set2 && set2Count < 2) {
    const artifact = _.find(artifacts, (artifact) =>
      artifactMatchesCriteria({
        artifact,
        artifactCriteria: currentArtifactCriteria,
        set: set2,
      })
    );
    const remainingArtifacts = findRemainingArtifacts({
      artifacts,
      artifactCriteria: remainingArtifactCriteria,
      set1,
      set1Count,
      set2,
      set2Count: artifact ? set2Count + 1 : set2Count,
      noSetCount,
      tab: `${tab}  `,
      includeNoSet,
    });
    let choice;
    if (!artifact) {
      choice = {
        artifacts: remainingArtifacts.artifacts,
        missingArtifactsCriteria: [
          currentArtifactCriteria,
          ...remainingArtifacts.missingArtifactsCriteria,
        ],
      };
    } else {
      choice = {
        artifacts: [artifact, ...remainingArtifacts.artifacts],
        missingArtifactsCriteria: remainingArtifacts.missingArtifactsCriteria,
      };
    }
    // console.log(`${tab}Set 2 Choice: ${JSON.stringify(choice)}`);
    choices.push(choice);
  }
  if (noSetCount < 1) {
    let artifact;
    if (includeNoSet) {
      artifact = _.find(artifacts, (artifact) =>
        artifactMatchesCriteria({
          artifact,
          artifactCriteria: currentArtifactCriteria,
        })
      );
    }
    const remainingArtifacts = findRemainingArtifacts({
      artifacts,
      artifactCriteria: remainingArtifactCriteria,
      set1,
      set1Count,
      set2,
      set2Count,
      noSetCount: artifact ? noSetCount + 1 : noSetCount,
      tab: `${tab}  `,
      includeNoSet,
    });
    let choice;
    if (!artifact) {
      choice = {
        artifacts: remainingArtifacts.artifacts,
        missingArtifactsCriteria: [
          currentArtifactCriteria,
          ...remainingArtifacts.missingArtifactsCriteria,
        ],
      };
    } else {
      choice = {
        artifacts: [artifact, ...remainingArtifacts.artifacts],
        missingArtifactsCriteria: remainingArtifacts.missingArtifactsCriteria,
      };
    }
    // console.log(`${tab}No Set Choice: ${JSON.stringify(choice)}`);
    choices.push(choice);
  }
  const choice = _.minBy(choices, (choice) =>
    _.sumBy(choice.missingArtifactsCriteria, (criteria) => criteria.difficulty)
  );
  // console.log(`${tab}Selected Choice: ${JSON.stringify(choice)}`);
  if (_.isUndefined(choice)) {
    console.log("eek");
  }
  return choice;
};

const findMatchingArtifactsForCharacter = ({ character, artifacts }) => {
  character.artifactCriteria.forEach((artifactCriteria) => {
    artifactCriteria.difficulty =
      rateArtifactCriteriaDifficulty(artifactCriteria);
  });
  let matchingArtifacts = findRemainingArtifacts({
    artifacts: _.filter(
      artifacts,
      (artifact) => !artifact.owner || artifact.owner === character.name
    ),
    artifactCriteria: character.artifactCriteria,
    set1: character.set1,
    set2: character.set2,
  });
  if (matchingArtifacts.artifacts.length === 4) {
    matchingArtifacts = findRemainingArtifacts({
      artifacts: _.filter(
        artifacts,
        (artifact) => !artifact.owner || artifact.owner === character.name
      ),
      artifactCriteria: character.artifactCriteria,
      set1: character.set1,
      set2: character.set2,
      includeNoSet: true,
    });
  }
  matchingArtifacts.artifacts.forEach(
    (artifact) => (artifact.owner = character.name)
  );
  character.artifacts = matchingArtifacts.artifacts;
  character.missingArtifactsCriteria =
    matchingArtifacts.missingArtifactsCriteria;
  return matchingArtifacts;
};

module.exports = findMatchingArtifactsForCharacter;
