import { Model, DataTypes } from 'sequelize';
import sequelize from '../baseDatos/connection.js';
import Producto from '../model/ProductoModel.js'

class Categoria extends Model {}

Categoria.init({
    num_categoria: {
        type: DataTypes.INTEGER,
        unique: true,
        primaryKey: true,
        autoIncrement: true
    },
    nombre_categoria: {
        type: DataTypes.STRING,
        allowNull: false
    },
    descripcion_categoria: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    imagen: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    sequelize,
    modelName: 'Categoria',
    tableName: 'Categoria',
    timestamps: false
});

Categoria.hasMany(Producto, { foreignKey: 'id_categoria', as: 'productos' });

export default Categoria;