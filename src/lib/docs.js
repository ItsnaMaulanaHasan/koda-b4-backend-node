import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

function initDocs(app) {
  const options = {
    definition: {
      openapi: "3.0.0",
      info: {
        version: "1.8.0",
        title: "Backend JS Daily Greens",
        description: "API documentation for Daily Greens application",
      },
      components: {
        securitySchemes: {
          BearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
          },
        },
      },
    },

    apis: ["./src/**/*.js"],
  };

  const openapiSpecification = swaggerJsdoc(options);

  app.use("/docs", swaggerUi.serve, swaggerUi.setup(openapiSpecification));
}

export default initDocs;
