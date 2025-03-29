import Producto from './ProductoModel.js';
import Categoria from './CategoriaModel.js';
import Imagen from './ImagenModel.js';
import Talla from './TallaModel.js';
import ProductoTalla from './ProductoTallaModel.js';
import Carrito from './CarritoModel.js';
import CarritoProducto from './CarritoProductoModel.js';

// Relación Categoría - Producto (1:N)
Categoria.hasMany(Producto, { foreignKey: 'id_categoria', as: 'productos' });
Producto.belongsTo(Categoria, { foreignKey: 'id_categoria', as: 'categoria' });

// Relación Producto - Imagen (1:N)
Producto.hasMany(Imagen, { foreignKey: "id_producto", as: 'imagenes' });
Imagen.belongsTo(Producto, { foreignKey: "id_producto", as: 'producto' });

// Relación Producto - Talla (N:M)
Producto.belongsToMany(Talla, { through: ProductoTalla, foreignKey: 'id_producto', as: 'tallas' });
Talla.belongsToMany(Producto, { through: ProductoTalla, foreignKey: 'id_talla', as: 'productos' });

// Relación Carrito - Producto (N:M a través de CarritoProducto)
Carrito.belongsToMany(Producto, { through: CarritoProducto, foreignKey: 'id_carrito', as: 'productos' });
Producto.belongsToMany(Carrito, { through: CarritoProducto, foreignKey: 'id_producto', as: 'carritos' });

// Mensaje de confirmación
export default function ConfRelaciones() {
    console.log("Asociaciones configuradas correctamente");
}
