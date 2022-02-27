import _ from "lodash";
import { Artifact, ArtifactSlotCriteria } from "./types";

const artifactMatchesCriteria = ({
  artifact,
  artifactSlotCriteria,
  setKey,
}: {
  artifact: Artifact;
  artifactSlotCriteria: ArtifactSlotCriteria;
  setKey?: string;
}): boolean => {
  if (setKey && setKey !== artifact.setKey) {
    return false;
  }
  if (
    artifactSlotCriteria.slotKey &&
    artifact.slotKey !== artifactSlotCriteria.slotKey
  ) {
    return false;
  }
  if (
    artifactSlotCriteria.mainStatKey &&
    artifact.mainStatKey !== artifactSlotCriteria.mainStatKey
  ) {
    return false;
  }
  _.forEach(artifactSlotCriteria.substats, (substatCriteria) => {
    if (
      !_.includes(
        _.map(artifact.substats, (substat) => substat.key),
        substatCriteria.key
      )
    ) {
      return false;
    }
  });
  return true;
};

export default artifactMatchesCriteria;
