const sql = require("msnodesqlv8");

const connectionString = "Server=localhost\\MSSQLSERVER01;Database=MrWolfDB;User Id=sa;Password=sa12345678;Driver={SQL Server}";

// Obtener los nombres de las tablas
const getTablesQuery = "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE='BASE TABLE';";

sql.query(connectionString, getTablesQuery, (err, tables) => {
    if (err) {
        console.error("Error obteniendo las tablas:", err);
        return;
    }
    tables.forEach(table => {
        const tableName = table.TABLE_NAME;
        const dataQuery = `SELECT * FROM ${tableName};`;
        
        sql.query(connectionString, dataQuery, (err, rows) => {
            if (err) {
                console.error(`Error obteniendo datos de la tabla ${tableName}:`, err);
                return;
            }
            console.log(`Datos de la tabla ${tableName}:`, rows);
        });
    });
});
