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
        },
    
    productoId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
            model: Producto,
            key: 'id'
        }
    },
    cantidad: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
    }
}, {
    sequelize,
    modelName: 'Carrito',
    tableName: 'Carritos',
    schema: "dbo",
    timestamps: true
});

// Aquí se define la relación
Carrito.belongsTo(Producto, { foreignKey: 'productoId' });
Producto.hasMany(Carrito, { foreignKey: 'productoId' });

export default Carrito;