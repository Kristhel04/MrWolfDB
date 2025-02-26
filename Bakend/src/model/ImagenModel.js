import { DataTypes } from "sequelize";
import sequelize from '../baseDatos/connection.js';

const Imagen = sequelize.define("Imagen", {
    num_imagen: { 
        type: DataTypes.INTEGER, 
        primaryKey: true, 
        autoIncrement: true },
    id_producto: { 
        type: DataTypes.INTEGER },
    nomImagen: { 
        type: DataTypes.STRING }
});

export default Imagen;
