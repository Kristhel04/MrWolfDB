import { Model, DataTypes } from 'sequelize';
import sequelize from '../baseDatos/connection.js';
import Producto from "../model/ProductoModel.js";

class CarritoProducto extends Model {}
    
CarritoProducto.init({
    id: { 
        type: DataTypes.INTEGER, 
        primaryKey: true, 
        autoIncrement: true 
    },
    carrito_id: {
         type: DataTypes.INTEGER, 
         allowNull: false 
        },
    producto_id: {
        type: DataTypes.INTEGER, 
        allowNull: false 
    },
    cantidad: {
         type: DataTypes.INTEGER, 
         allowNull: false 
        },
    precio: { 
        type: DataTypes.DECIMAL(10, 2), 
        allowNull: false }
}, {
sequelize,
modelName: 'CarritoProducto',
tableName: 'Carrito_Producto',
timestamps: true
});

export default CarritoProducto;