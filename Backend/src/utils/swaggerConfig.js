const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "QADS API Documentation",
      version: "2.0.0",
      description: "QADS API documentation",
    },
    servers: [
      {
        url: "http://localhost:4000",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: [
    "./src/modules/Authentication/*.js",
    "./src/modules/User/*.js",
    "./src/modules/Campaign/advertiser/*.js",
    "./src/modules/Campaign/promoter/*.js",
    "./src/modules/Campaign/admin/*.js",
  ],
};

const specs = swaggerJsdoc(options);

module.exports = { swaggerUi, specs };