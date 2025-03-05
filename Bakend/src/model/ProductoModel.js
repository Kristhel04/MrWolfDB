import { Model, DataTypes } from 'sequelize';
import sequelize from '../baseDatos/connection.js';
import Imagen from '../model/ImagenModel.js';
import Categoria from '../model/CategoriaModel.js';
import Talla from '../model/TallaModel.js';

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
    estado:{
        type: DataTypes.STRING,
        allowNull: true
    },
    genero_dirigido:{
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isIn: [['Masculino', 'Femenino']] 
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