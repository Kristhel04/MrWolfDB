import { Model, DataTypes } from 'sequelize';
import sequelize from '../baseDatos/connection.js';

class Talla extends Model {}

Talla.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    }
}, {
    sequelize,
    modelName: 'Talla',
    tableName: 'Tallas',
    timestamps: false
});

export default Talla;
