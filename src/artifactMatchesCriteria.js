const _ = require("lodash");

module.exports = ({ artifact, artifactCriteria, set }) => {
  if (set && set.name !== artifact.set) {
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
};
