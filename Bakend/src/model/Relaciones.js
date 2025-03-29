import Producto from './ProductoModel.js';
import Categoria from './CategoriaModel.js';
import Imagen from './ImagenModel.js';
import Talla from './TallaModel.js';
import ProductoTalla from'./ProductoTallaModel.js';

Categoria.hasMany(Producto, { foreignKey: 'id_categoria', as: 'productos' });
Producto.belongsTo(Categoria, { foreignKey: 'id_categoria', as: 'categoria' });

Producto.hasMany(Imagen, { foreignKey: "id_producto", as:'imagenes'});
Imagen.belongsTo(Producto, { foreignKey: "id_producto",as:'producto' });

Producto.belongsToMany(Talla, { through: ProductoTalla, foreignKey: 'id_producto', as: 'tallas' });
Talla.belongsToMany(Producto, { through: ProductoTalla, foreignKey: 'id_talla', as: 'product' });



export default function ConfRelaciones() {
    console.log("Asociaciones configuradas correctamente");
}
