import { Model, DataTypes } from 'sequelize';
import sequelize from '../baseDatos/connection.js';

class Producto extends Model {}

Producto.init({

    id:{
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    codigo:{
        type: DataTypes.STRING,
        allowNull: true
    },
    nombre:{
        type: DataTypes.STRING,
        allowNull: true
    },
    precio:{
        type: DataTypes.FLOAT,
        allowNull: true
    },
    descripcion:{
        type: DataTypes.TEXT,
        allowNull: false
    },
    talla:{
        type: DataTypes.STRING,
        allowNull: true
    },
    estado:{
        type: DataTypes.STRING,
        allowNull: true
    },
    imagen:{
        type: DataTypes.STRING,
        allowNull: false
    },
    genero_dirigido:{
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isIn: [['Masculino', 'Femenino']] // Valida que sea uno de estos valores
        }
    },
    id_categoria:{
        type: DataTypes.INTEGER,
        allowNull: false
    }
},{
    sequelize,
    modelName: 'Producto',
    tableName: 'Productos',
    timestamps: false
});

export default Producto;