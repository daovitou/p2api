import swaggerJSDoc from "swagger-jsdoc";
// Swagger definition

const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.1.1",
    info: {
      title: "Agri Docs APIs",
      version: "1.0.0",
      description: "API documentation using Swagger",
      license: {
        name: "MIT",
        url: "https://spdx.org/licenses/MIT.html",
      },
      contact: {
        name: "Mr. Vitou Dao",
        url: "https://www.daovitou.net",
        email: "vitoudao@gmail.com",
      },
    },
    servers: [
      {
        url: `http://localhost:4000`,
        description: "development server",
      },
    ],
    components: {
      securitySchemes: {
        Bearer: {
          type: "apiKey",
          name: "Authorization",
          in: "header",
          bearerFormat: "JWT",
        },
      },
    },
    security: [{ Bearer: [] }],
    defaultSecurity: "Bearer",
  },
  apis: ["./src/routes/*.ts"], // Path to your API docs
};
const swaggerDocs = swaggerJSDoc(swaggerOptions);
export default swaggerDocs;
