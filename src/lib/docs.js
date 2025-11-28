import expressJSDocSwagger from "express-jsdoc-swagger";
import process from "node:process";

function initDocs(app) {
  const options = {
    info: {
      version: "1.8.0",
      title: "Backend JS Daily Greens",
    },
    baseDir: process.cwd(),
    filesPattern: "./src/**/*.js",
    exposeSwaggerUI: true,
    exposeApiDocs: false,
    notRequiredAsNullable: false,
  };

  expressJSDocSwagger(app)(options);
}

export default initDocs;
