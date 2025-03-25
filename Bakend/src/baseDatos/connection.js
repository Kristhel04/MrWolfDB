import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const env = process.env.NODE_ENV || "development";

// Configuración para cada entorno
const config = {
  test: {
    dialect: "sqlite",
    storage: ":memory:", // Base de datos en memoria para tests
    logging: false, // Desactiva logging en tests
  },
  development: {
    dialect: "mssql",
    host: process.env.DB_HOST,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    dialectOptions: {
      encrypt: false,
      trustServerCertificate: true,
    },
  },
  production: {
    dialect: "mssql",
    host: process.env.DB_HOST,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    dialectOptions: {
      encrypt: true, // En producción debería ser true
      trustServerCertificate: false, // En producción debería ser false
    },
  },
};

const sequelize = new Sequelize(config[env]);

// Solo ejecutar estas pruebas de conexión en entornos que no sean test
if (env !== "test") {
  const testConnection = async () => {
    try {
      await sequelize.authenticate();
      console.log("Conexión a la base de datos establecida correctamente.");
    } catch (error) {
      console.error("No se pudo conectar a la base de datos:", error);
    }
  };

  const testQuery = async () => {
    try {
      const result = await sequelize.query(
        "SELECT SERVERPROPERTY('MachineName') AS serverName"
      );
      console.log("Nombre del servidor:", result[0][0].serverName);
    } catch (error) {
      console.error("Error en la consulta:", error);
    }
  };

  testConnection();
  testQuery();
}

export default sequelize;

