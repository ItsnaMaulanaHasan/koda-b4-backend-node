import expressJSDocSwagger from "express-jsdoc-swagger";
import { cwd } from "node:process";

function initDocs(app) {
  const options = {
    info: {
      version: "1.8.0",
      title: "Backend JS Daily Greens",
    },
    baseDir: cwd(),
    filesPattern: "./src/**/*.js",
  };

  expressJSDocSwagger(app)(options);
}

export default initDocs;
