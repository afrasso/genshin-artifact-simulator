import _ from "lodash";
import percentile from "percentile";
import { v4 as uuid } from "uuid";

import { Build, GenshinOpenOpjectDescription } from "../src/types";

import simulate from "../src/index";

import goodData from "../example/compiledData/good.json";
import rawBuilds from "../example/compiledData/builds.json";

const builds = _.map(rawBuilds, (rb) => _.merge({ id: uuid() }, rb) as Build);

const simulations = simulate({
  builds: builds,
  goodData: goodData as GenshinOpenOpjectDescription,
  runs: 1000,
});

const percentiles = [5, 10, 25, 50, 75, 90, 95];
const data = percentile(
  percentiles,
  _.map(simulations, (simulation) => simulation.totalResinSpent)
);

percentiles.forEach((percentile, idx) => {
  console.log(
    `${percentile}th percentile: ${data[idx]} resin, ${
      Math.round(data[idx] / 1.8) / 100
    } days`
  );
});
