import { Model, DataTypes } from 'sequelize';
import sequelize from '../baseDatos/connection.js';
import Imagen from '../model/ImagenModel.js';
import Categoria from './model/CategoriaModel.js';

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

Producto.belongsTo(Categoria, { foreignKey: 'id_categoria', as: 'categoria' });
Producto.hasMany(Imagen, { foreignKey: "id_producto", as: "imagenes" });


export default Producto;