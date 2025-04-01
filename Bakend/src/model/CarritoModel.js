import { Model, DataTypes } from 'sequelize';
import sequelize from '../baseDatos/connection.js';
import Producto from "../model/ProductoModel.js";

    class Carrito extends Model {}
    
    Carrito.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        usuarioId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        }
}, {
    sequelize,
    modelName: 'Carrito',
    tableName: 'Carritos',
    schema: "dbo",
    timestamps: true
});

export default Carrito;
// Aquí se define la relación
Carrito.belongsTo(Producto, { foreignKey: 'productoId' });
Producto.hasMany(Carrito, { foreignKey: 'productoId' });
