import _ from "lodash";

import simulate, {
  Artifact,
  ArtifactSetBonus,
  ArtifactSlotKey,
  Build,
} from "../src";
import rng from "../src/rng";

import generateArtifact from "./helpers/generateArtifact";
import generateBuild from "./helpers/generateBuild";

let mockRng: jest.MockedFunction<typeof rng>;

jest.mock("../src/rng", () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  mockRng = jest.fn((key) => Math.random());
  return {
    __esModule: true,
    default: mockRng,
  };
});

interface MockRngForKey {
  key: string;
  values: number[];
  idx?: number;
}

const initializeMockRngsByKey = (mockRngsByKey: MockRngForKey[]): void => {
  _.forEach(mockRngsByKey, (mockRngForKey) => (mockRngForKey.idx = 0));
  mockRng.mockImplementation((key: string): number => {
    const mockRngForKey = _.find(
      mockRngsByKey,
      (mockRngForKey) => mockRngForKey.key === key
    );
    if (_.isNil(mockRngForKey)) {
      return Math.random();
    }
    if (mockRngForKey.idx >= mockRngForKey.values.length) {
      mockRngForKey.idx = 0;
    }
    const result = mockRngForKey.values[mockRngForKey.idx];
    mockRngForKey.idx++;
    return result;
  });
};

const numRngCallsForKey = (key: string): number => {
  return _.filter(mockRng.mock.calls, (call) => call[0] === key).length;
};

test("Calling simulate with no parameters", () => {
  expect(simulate()).toEqual([{ builds: [], totalResinSpent: 0 }]);
});

test("Calling simulate with an empty object", () => {
  expect(simulate({})).toEqual([{ builds: [], totalResinSpent: 0 }]);
});

test("Calling simulate with an empty builds array", () => {
  expect(simulate({ builds: [] })).toEqual([
    { builds: [], totalResinSpent: 0 },
  ]);
});

test("Calling simulate with a single empty build", () => {
  initializeMockRngsByKey([
    {
      key: "dropCount",
      values: [0.5],
    },
    {
      key: "slot",
      values: [0.05, 0.15, 0.25, 0.35, 0.45, 0.55, 0.65, 0.75, 0.85, 0.95],
    },
  ]);
  const build = generateBuild();
  expect(simulate({ builds: [build] })).toEqual([
    { builds: [{ resinSpent: 180 }], totalResinSpent: 180 },
  ]);
  expect(numRngCallsForKey("dropCount")).toBe(9);
  expect(numRngCallsForKey("slot")).toBe(9);
});

test("Calling simulate with two empty builds", () => {
  initializeMockRngsByKey([
    {
      key: "dropCount",
      values: [0.5],
    },
    {
      key: "slot",
      values: [0.05, 0.15, 0.25, 0.35, 0.45, 0.55, 0.65, 0.75, 0.85, 0.95],
    },
  ]);
  const build1 = generateBuild();
  const build2 = generateBuild();
  expect(simulate({ builds: [build1, build2] })).toEqual([
    { builds: [{ resinSpent: 180 }, { resinSpent: 20 }], totalResinSpent: 200 },
  ]);
  expect(numRngCallsForKey("dropCount")).toBe(10);
  expect(numRngCallsForKey("slot")).toBe(10);
});

test("Calling simulate with an empty build and enough artifacts", () => {
  const build = generateBuild();
  const artifacts: Artifact[] = [
    generateArtifact({ slotKey: ArtifactSlotKey.flower }),
    generateArtifact({ slotKey: ArtifactSlotKey.plume }),
    generateArtifact({ slotKey: ArtifactSlotKey.sands }),
    generateArtifact({ slotKey: ArtifactSlotKey.goblet }),
    generateArtifact({ slotKey: ArtifactSlotKey.circlet }),
  ];
  expect(simulate({ builds: [build], goodData: { artifacts } })).toEqual([
    { builds: [{ resinSpent: 0 }], totalResinSpent: 0 },
  ]);
  expect(numRngCallsForKey("slot")).toBe(0);
  expect(numRngCallsForKey("dropCount")).toBe(0);
});

test("Calling simulate with an empty build and the wrong artifacts", () => {
  initializeMockRngsByKey([
    {
      key: "dropCount",
      values: [0.5],
    },
    {
      key: "set",
      // This should result in only the second of the two artifact sets being
      // dropped by the domain. In this case, that's RetracingBolide.
      values: [0.75],
    },
    {
      key: "slot",
      values: [0.1, 0.3, 0.5, 0.7, 0.9],
    },
  ]);
  const build = generateBuild();
  build.setsCriteria.push({
    setKey: "RetracingBolide",
    setBonus: ArtifactSetBonus.fourPiece,
  });
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
  ];
  expect(simulate({ builds: [build], goodData: { artifacts } })).toEqual([
    { builds: [{ resinSpent: 80 }], totalResinSpent: 80 },
  ]);
  expect(numRngCallsForKey("dropCount")).toBe(4);
  expect(numRngCallsForKey("set")).toBe(4);
  expect(numRngCallsForKey("slot")).toBe(4);
});

test("Calling simulate with a four-piece set restriction", () => {
  initializeMockRngsByKey([
    {
      key: "dropCount",
      values: [0.5],
    },
    {
      key: "set",
      // This should result in only the second of the two artifact sets being
      // dropped by the domain. In this case, that's OceanHuedClam.
      values: [0.75],
    },
    {
      key: "slot",
      values: [0.05, 0.15, 0.25, 0.35, 0.45, 0.55, 0.65, 0.75, 0.85, 0.95],
    },
  ]);
  const build = generateBuild();
  build.setsCriteria.push({
    setKey: "OceanHuedClam",
    setBonus: ArtifactSetBonus.fourPiece,
  });
  expect(simulate({ builds: [build] })).toEqual([
    { builds: [{ resinSpent: 180 }], totalResinSpent: 180 },
  ]);
  expect(numRngCallsForKey("dropCount")).toBe(9);
  expect(numRngCallsForKey("set")).toBe(9);
  expect(numRngCallsForKey("slot")).toBe(9);
});

test("Calling simulate with a build that has multiple slots criteria with the same slot key", () => {
  const build = generateBuild();
  build.slotsCriteria.push(
    {
      slotKey: ArtifactSlotKey.flower,
    },
    {
      slotKey: ArtifactSlotKey.flower,
    }
  );
  expect(() => simulate({ builds: [build] })).toThrow(
    `For build "${build.id}" found 2 slot criteria for slot key "flower".`
  );
});

test("Calling simulate with two identical builds", () => {
  const build: Build = generateBuild();
  expect(() => simulate({ builds: [build, build] })).toThrow(
    `Multiple specified builds had the same id: ${build.id}`
  );
});
