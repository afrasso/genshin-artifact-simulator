const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");

const compileYaml = (inputDir, outputDir) => {
  const files = fs.readdirSync(inputDir);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }
  for (const file of files) {
    const json = yaml.load(fs.readFileSync(path.join(inputDir, file)));
    fs.writeFileSync(
      path.join(outputDir, path.parse(file).name + ".json"),
      JSON.stringify(json)
    );
  }
};

compileYaml("./data", "./compiledData");
compileYaml("./example/data", "./example/compiledData");
