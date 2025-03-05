import { Model, DataTypes } from "sequelize";
import sequelize from "../baseDatos/connection.js";

class ProductoTalla extends Model {}

ProductoTalla.init(
    {
        id_producto: {
            type: DataTypes.INTEGER,
            primaryKey: true,
        },
        id_talla: {
            type: DataTypes.INTEGER,
            primaryKey: true,
        }
    },
    {
        sequelize,
        modelName: "ProductoTalla",
        tableName: "Producto_Tallas",
        timestamps: false
    }
);

export default ProductoTalla;
