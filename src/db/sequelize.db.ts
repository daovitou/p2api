import { Sequelize } from "sequelize";

const dbName: string = process.env.POSTGRE_DB || "agridoc_db";
const dbUser: string = process.env.POSTGRE_USER || "agridoc";
const dbPassword: string = process.env.POSTGRE_PASSWORD || "agridoc@123";
const dbPort: number = Number(process.env.POSTGRE_PORT) || 5432;
const dbHost: string = process.env.POSTGRE_HOST || "localhost";

const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
  host: dbHost,
  port: dbPort,
  dialect: "postgres",
  dialectOptions: {},
  timezone: "+07:00",
  logging: false,
});

sequelize
  .sync({ force: false, alter: true })
  .then(() => {
    console.log(`Database synchronized`);
  })
  .catch((error) => console.log(`Failed to synchronized database:`, error));

export { sequelize };
