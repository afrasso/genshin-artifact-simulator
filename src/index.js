const _ = require("lodash");
const { sets } = require("./loadSets.js");
const artifactMatchesCriteria = require("./artifactMatchesCriteria.js");
const farmArtifacts = require("./farmArtifacts.js");
const findMatchingArtifactsForCharacter = require("./findMatchingArtifactsForCharacter.js");

// Clone each build and set the set1 and set2 properties to be the set object.
const initializeBuilds = ({ builds, artifacts }) => {
  const initializedBuilds = _.cloneDeep(builds);
  initializedBuilds.forEach((build) => {
    build.set1 = _.find(sets, (set) => set.name === build.set1);
    if (build.set2) {
      build.set2 = _.find(sets, (set) => set.name === build.set2);
    }
    findMatchingArtifactsForCharacter({ character: build, artifacts });
  });
  return initializedBuilds;
};

const simulate = ({ builds, artifacts }) => {
  builds = initializeBuilds({ builds, artifacts });
  builds.forEach((build) => {
    build.resinSpent = 0;
    while (_.size(build.artifacts) < 5) {
      const set1ArtifactCount = _.filter(
        build.artifacts,
        (artifact) => artifact.set === build.set1.name
      ).length;
      const set2ArtifactCount = build.set2
        ? _.filter(
            build.artifacts,
            (artifact) => artifact.set === build.set2.name
          ).length
        : 0;
      let set;
      if (
        (_.isUndefined(build.set2) && set1ArtifactCount < 4) ||
        set1ArtifactCount < 2
      ) {
        set = build.set1;
      } else if (!_.isUndefined(build.set2) && set2ArtifactCount < 2) {
        set = build.set2;
      }
      let newArtifacts = [];
      let cumulativeNewArtifacts = [];
      while (
        _.isEmpty(
          _.intersectionWith(
            newArtifacts,
            build.missingArtifactsCriteria,
            (artifact, artifactCriteria) =>
              artifactMatchesCriteria({ artifact, artifactCriteria, set })
          )
        )
      ) {
        const results = farmArtifacts({ set });
        newArtifacts = results.artifacts;
        build.resinSpent += results.resinCost;
        cumulativeNewArtifacts.push(...newArtifacts);
      }
      artifacts.push(...cumulativeNewArtifacts);
      findMatchingArtifactsForCharacter({
        character: build,
        artifacts,
      });
    }
  });
  return {
    totalResinSpent: _.sumBy(builds, (build) => build.resinSpent),
    builds: _.map(builds, (build) => _.pick(build, ["name", "resinSpent"])),
  };
};

module.exports = {
  simulate: ({ builds, good, runs }) => {
    const artifacts = _.map(_.cloneDeep(good.artifacts), (artifact) => {
      artifact.set = artifact.setKey;
      artifact.type = artifact.slotKey;
      artifact.stat = artifact.mainStatKey;
      return artifact;
    });
    return _.times(runs, () =>
      simulate({
        builds: _.cloneDeep(builds),
        artifacts: _.cloneDeep(artifacts),
      })
    );
  },
};
