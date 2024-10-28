import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        dialect: 'mssql',
        port: process.env.DB_PORT,
        dialectOptions: {
            encrypt: false,
            trustServerCertificate: true
        }
    }
);

export default sequelize;


const testConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log('Conexión a la base de datos establecida correctamente.');
    } catch (error) {
        console.error('No se pudo conectar a la base de datos:', error);
    }
};
testConnection();
const testQuery = async () => {
    try {
        const result = await sequelize.query("SELECT SERVERPROPERTY('MachineName') AS serverName");
        console.log('Nombre del servidor:', result[0][0].serverName);
    } catch (error) {
        console.error('Error en la consulta:', error);
    }
};
testQuery();

