import { v4 as uuid } from "uuid";

import { Build } from "../../src/types";

const generateBuild = (): Build => {
  return {
    id: uuid(),
    name: uuid(),
    setsCriteria: [],
    slotsCriteria: [],
  };
};

export default generateBuild;
