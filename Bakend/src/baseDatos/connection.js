import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const env = process.env.NODE_ENV || "development";

// Configuración para cada entorno
const config = {
  test: {
    dialect: "sqlite",
    storage: ":memory:", // Base de datos en memoria para tests
    logging: false,      // Desactiva logging en tests
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
    port: Number(process.env.DB_PORT),
    dialectOptions: {
      encrypt: true,                  // obligatorio en Azure SQL
      trustServerCertificate: false,
    },
    logging: false,
  },
};

const sequelize = new Sequelize(config[env]);

// Sólo ejecutar estas pruebas de conexión en entornos que no sean test
if (env !== "test") {
  // Función para probar la conexión
  const testConnection = async () => {
    try {
      await sequelize.authenticate();
      console.log(
        `✔ Conectado (${env}) a ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`
      );
    } catch (err) {
      console.error("✖ No se pudo conectar a la base de datos:", err);
    }
  };

  // Función de ejemplo para ejecutar una consulta simple
  const testQuery = async () => {
    try {
      const [rows] = await sequelize.query(
        "SELECT SERVERPROPERTY('MachineName') AS serverName"
      );
      console.log("Nombre del servidor:", rows[0].serverName);
    } catch (error) {
      console.error("Error en la consulta:", error);
    }
  };

  // Invocaciones
  testConnection();
  testQuery();
}

export default sequelize;
