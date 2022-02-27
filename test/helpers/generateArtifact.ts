import { Artifact, ArtifactSlotKey, ArtifactStatKey } from "../../src/types";

const generateArtifact = (
  {
    setKey = "ArchaicPetra",
    slotKey = ArtifactSlotKey.flower,
    mainStatKey = ArtifactStatKey.hp_,
  }: {
    setKey?: string;
    slotKey?: ArtifactSlotKey;
    mainStatKey?: ArtifactStatKey;
  } = {
    setKey: "ArchaicPetra",
    slotKey: ArtifactSlotKey.flower,
    mainStatKey: ArtifactStatKey.hp_,
  }
): Artifact => {
  return {
    setKey,
    slotKey,
    rarity: 5,
    mainStatKey,
  };
};

export default generateArtifact;
