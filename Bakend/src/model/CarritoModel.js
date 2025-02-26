import { Model, DataTypes } from 'sequelize';
import sequelize from '../baseDatos/connection.js';
import Producto from './ProductoModel.js'; // Importar Producto

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
    },
    cantidad: {
        type: DataTypes.INTEGER,
        allowNull: false,
    }
}, {
    sequelize,
    modelName: 'Carrito',
    tableName: 'Carritos',
    timestamps: false
});

// Aquí se define la relación
Carrito.belongsTo(Producto, { foreignKey: 'productoId' });
Producto.hasMany(Carrito, { foreignKey: 'productoId' });

export default Carrito;
