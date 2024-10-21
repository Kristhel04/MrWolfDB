const sql = require("msnodesqlv8");
const bcrypt = require("bcrypt");

const connectionString = "Server=localhost\\MSSQLSERVER01;Database=MrWolfDB;User Id=sa;Password=sa12345678;Driver={SQL Server}";

const UserModel = {
    create: (usuario, callback) => {
        const saltRounds = 10;
        bcrypt.hash(usuario.contraseña, saltRounds, (err, hashedPassword) => {
            if (err) {
                return callback(err);
            }

            const query = `
                INSERT INTO Usuario (nombre_usuario, nombre_completo, email, contraseña, cedula, telefono, direccion_envio, email_facturacion, imagen, rol)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            const params = [
                usuario.nombre_usuario,
                usuario.nombre_completo,
                usuario.email,
                hashedPassword,
                usuario.cedula,
                usuario.telefono,
                usuario.direccion_envio,
                usuario.email_facturacion,
                usuario.imagen,
                usuario.rol
            ];

            sql.query(connectionString, query, params, (err, result) => {
                callback(err, result);
            });
        });
    },

    getAll: (callback) => {
        const query = "SELECT * FROM Usuario";
        
        sql.query(connectionString, query, (err, rows) => {
            callback(err, rows);
        });
    },

    getById: (idUsuario, callback) => {
        const query = "SELECT * FROM Usuario WHERE id_usuario = ?";
        
        sql.query(connectionString, query, [idUsuario], (err, row) => {
            callback(err, row);
        });
    },

    update: (idUsuario, usuario, callback) => {
        const query = `
            UPDATE Usuario 
            SET nombre_usuario = ?, nombre_completo = ?, email = ?, contraseña = ?, cedula = ?, telefono = ?, 
                direccion_envio = ?, email_facturacion = ?, imagen = ?, rol = ?
            WHERE id_usuario = ?`;
        const params = [
            usuario.nombre_usuario,
            usuario.nombre_completo,
            usuario.email,
            usuario.contraseña,
            usuario.cedula,
            usuario.telefono,
            usuario.direccion_envio,
            usuario.email_facturacion,
            usuario.imagen,
            usuario.rol,
            idUsuario
        ];
        
        sql.query(connectionString, query, params, (err, result) => {
            callback(err, result);
        });
    },

    delete: (idUsuario, callback) => {
        const query = "DELETE FROM Usuario WHERE id_usuario = ?";
        
        sql.query(connectionString, query, [idUsuario], (err, result) => {
            callback(err, result);
        });
    }
};

module.exports = UserModel;
