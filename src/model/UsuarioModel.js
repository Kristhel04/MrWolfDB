// src/models/Usuario.model.js
import { Model, DataTypes } from 'sequelize';
import sequelize from '../baseDatos/connection.js';

class Usuario extends Model {}

Usuario.init({
    cedula: {
        type: DataTypes.STRING,
        unique: true,
        primaryKey: true,
        allowNull: false
    },
    nombre_usuario: {
        type: DataTypes.STRING,
        allowNull: false
    },
    nombre_completo: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    contrasena: {
        type: DataTypes.STRING,
        allowNull: false
    },
    telefono: {
        type: DataTypes.STRING,
        allowNull: false
    },
    direccion_envio: {
        type: DataTypes.STRING,
        allowNull: true
    },
    email_facturacion: {
        type: DataTypes.STRING,
        allowNull: false
    },
    imagen: {
        type: DataTypes.STRING,
        allowNull: true
    },
    rol: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isIn: [['Administrador', 'Cliente']]
        }
    }
    
}, {
    sequelize,
    modelName: 'Usuario',
    tableName: 'Usuario',
    timestamps: false // O habilitar si tienes createdAt/updatedAt
});

export default Usuario;
