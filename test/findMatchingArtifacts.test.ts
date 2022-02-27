import _ from "lodash";

import { Artifact, ArtifactSetBonus, ArtifactSlotKey } from "../src";
import findMatchingArtifacts from "../src/findMatchingArtifacts";

import generateArtifact from "./helpers/generateArtifact";
import generateBuild from "./helpers/generateBuild";

const numArtifactsForSet = (artifacts: Artifact[], setKey: string): number => {
  return _.filter(artifacts, (artifact) => artifact.setKey === setKey).length;
};

test("Finding matching artifacts with four piece set bonus", () => {
  const build = generateBuild();
  build.setsCriteria.push({
    setKey: "RetracingBolide",
    setBonus: ArtifactSetBonus.fourPiece,
  });
  build.slotsCriteria.push(
    {
      slotKey: ArtifactSlotKey.flower,
    },
    {
      slotKey: ArtifactSlotKey.plume,
    },
    {
      slotKey: ArtifactSlotKey.sands,
    },
    {
      slotKey: ArtifactSlotKey.goblet,
    },
    {
      slotKey: ArtifactSlotKey.circlet,
    }
  );
  const artifacts: Artifact[] = [
    generateArtifact({
      setKey: "ArchaicPetra",
      slotKey: ArtifactSlotKey.flower,
    }),
    generateArtifact({
      setKey: "ArchaicPetra",
      slotKey: ArtifactSlotKey.plume,
    }),
    generateArtifact({
      setKey: "ArchaicPetra",
      slotKey: ArtifactSlotKey.sands,
    }),
    generateArtifact({
      setKey: "ArchaicPetra",
      slotKey: ArtifactSlotKey.goblet,
    }),
    generateArtifact({
      setKey: "ArchaicPetra",
      slotKey: ArtifactSlotKey.circlet,
    }),
    generateArtifact({
      setKey: "RetracingBolide",
      slotKey: ArtifactSlotKey.flower,
    }),
    generateArtifact({
      setKey: "RetracingBolide",
      slotKey: ArtifactSlotKey.plume,
    }),
    generateArtifact({
      setKey: "RetracingBolide",
      slotKey: ArtifactSlotKey.sands,
    }),
    generateArtifact({
      setKey: "RetracingBolide",
      slotKey: ArtifactSlotKey.goblet,
    }),
  ];
  findMatchingArtifacts({ build, artifacts });
  expect(build.artifacts.length).toBe(5);
  expect(build.missingSlotsCriteria.length).toBe(0);
  expect(numArtifactsForSet(build.artifacts, "ArchaicPetra")).toBe(1);
  expect(numArtifactsForSet(build.artifacts, "RetracingBolide")).toBe(4);
});
