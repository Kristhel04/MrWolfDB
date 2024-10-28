// src/models/Usuario.model.js
import { Model, DataTypes } from 'sequelize';
import sequelize from '../baseDatos/connection.js';

class Usuario extends Model {}

Usuario.init({
    id_usuario: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
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
    contraseña: {
        type: DataTypes.STRING,
        allowNull: false
    },
    cedula: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
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
