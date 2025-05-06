import Producto from './ProductoModel.js';
import Categoria from './CategoriaModel.js';
import Imagen from './ImagenModel.js';
import Talla from './TallaModel.js';
import ProductoTalla from './ProductoTallaModel.js';
import Factura from './FacturaModel.js';
import DetalleFactura from './DetalleFacturaModel.js';
import Usuario from './UsuarioModel.js'
// Relación Categoría - Producto (1:N)
Categoria.hasMany(Producto, { foreignKey: 'id_categoria',sourceKey: 'num_categoria',  as: 'productos' });
Producto.belongsTo(Categoria, { foreignKey: 'id_categoria',sourceKey: 'num_categoria', as: 'categoria' });

// Relación Producto - Imagen (1:N)
Producto.hasMany(Imagen, { foreignKey: "id_producto", as: 'imagenes' });
Imagen.belongsTo(Producto, { foreignKey: "id_producto", as: 'producto' });

// Relación Producto - Talla (N:M)
Producto.belongsToMany(Talla, { through: ProductoTalla, foreignKey: 'id_producto', as: 'tallas' });
Talla.belongsToMany(Producto, { through: ProductoTalla, foreignKey: 'id_talla', as: 'productos' });

 /// Relación Factura - DetalleFactura (1:N)
Factura.hasMany(DetalleFactura, { foreignKey: 'id_factura', as: 'detalles'});
DetalleFactura.belongsTo(Factura, { foreignKey: 'id_factura', as: 'factura' });

// Relación Factura - Usuario (N:1)
Usuario.hasMany(Factura, { foreignKey: 'cedula', sourceKey: 'cedula',as: 'facturas'});
Factura.belongsTo(Usuario, { foreignKey: 'cedula', targetKey: 'cedula', as: 'usuario'});

// Relación DetalleFactura - Producto (N:1)
Producto.hasMany(DetalleFactura, { foreignKey: 'id_producto', as: 'detallesFactura' });
DetalleFactura.belongsTo(Producto, { foreignKey: 'id_producto', as: 'producto' });


// Mensaje de confirmación
export default function ConfRelaciones() {
    console.log("Asociaciones configuradas correctamente");
}
