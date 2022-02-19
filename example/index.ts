import { map } from "lodash";
import percentile from "percentile";

import { Build, GenshinOpenOpjectDescription } from "../src/types";

import simulate from "../src/index";

import goodData from "../example/compiledData/good.json";
import builds from "../example/compiledData/builds.json";

const simulations = simulate({
  builds: builds as Build[],
  goodData: goodData as GenshinOpenOpjectDescription,
  runs: 1000,
});

const percentiles = [5, 10, 25, 50, 75, 90, 95];
const data = percentile(
  percentiles,
  map(simulations, (simulation) => simulation.totalResinSpent)
);

percentiles.forEach((percentile, idx) => {
  console.log(
    `${percentile}th percentile: ${data[idx]} resin, ${
      Math.round(data[idx] / 1.8) / 100
    } days`
  );
});
