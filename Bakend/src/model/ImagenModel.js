import {Model, DataTypes } from "sequelize";
import sequelize from '../baseDatos/connection.js';
import Producto from '../model/ProductoModel.js'

class Imagen extends Model {}
Imagen.init({
    num_imagen:{ 
        type: DataTypes.INTEGER, 
        primaryKey: true, 
        autoIncrement: true 
    },
    id_producto:{ 
        type: DataTypes.INTEGER },
    nomImagen: { 
        type: DataTypes.STRING 
    }
},{
    sequelize,
    modelName: 'Imagen',
    tableName: 'Imagen',
    timestamps: false
});
Imagen.belongsTo(Producto, { foreignKey: "id_producto" });

export default Imagen;
