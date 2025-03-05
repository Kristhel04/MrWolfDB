import Producto from "./ProductoModel.js";
import Categoria from "./CategoriaModel.js";
import Imagen from "./ImagenModel.js";

// Definir asociaciones después de importar todos los modelos
Categoria.hasMany(Producto, { foreignKey: 'id_categoria', as: 'productos' });
Producto.belongsTo(Categoria, { foreignKey: 'id_categoria', as: 'categoria' });

Producto.hasMany(Imagen, { foreignKey: "id_producto" });
Imagen.belongsTo(Producto, { foreignKey: "id_producto" });

export default function setupAssociations() {
    console.log("Asociaciones configuradas correctamente");
}
