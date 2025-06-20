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
        allowNull: false,
        references: {
            model: 'Categoria', // Debe coincidir con el nombre de la tabla en la base de datos
            key: 'num_categoria'
        }
    }
},{
    sequelize,
    modelName: 'Producto',
    tableName: 'Productos',
    timestamps: false
});
  
export default Producto;