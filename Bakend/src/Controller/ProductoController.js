import Producto from "../model/ProductoModel.js";

const ProductoController = {

    async getAll(req, res) {
        try {
            const productos = await Producto.findAll();
            res.status(200).json(productos);
        } catch (error) {
            res.status(500).json({ message: 'Error al obtener los productos', error });
        }
    },

    async busqueda(req, res) {
        try {
            const { nombre, codigo } = req.body;
    
            // Verificar si se proporcionó `nombre` o `codigo`
            if (!nombre && !codigo) {
                return res.status(400).json({ message: 'Debes proporcionar un nombre o un código para buscar el producto' });
            }
    
            //  condiciones de búsqueda
            const condiciones = {};
            if (nombre) {
                condiciones.nombre = nombre;
            }
            if (codigo) {
                condiciones.codigo = codigo;
            }
    
            const producto = await Producto.findOne({ where: condiciones });

            // Verificar si se encontró el producto
            if (producto) {
                res.status(200).json(producto);
            } else {
                res.status(404).json({ message: 'Producto no encontrado' });
            }
        } catch (error) {
            res.status(500).json({ message: 'Error al obtener el producto', error });
        }
    },
    
    
    async create(req, res) {
        try {
            const { codigo, nombre, precio, descripcion, talla, estado, imagen, genero_dirigido, id_Categoria } = req.body;
            const nuevaProducto = await Producto.create({
                codigo,
                nombre,
                precio,
                descripcion,
                talla,
                estado,
                imagen,
                genero_dirigido,
                id_Categoria
            });
            
            // Agregar mensaje de éxito
            res.status(201).json({
                message: 'Producto agregado correctamente',
                producto: nuevaProducto
            });
        } catch (error) {
            res.status(500).json({ 
                message: 'Error al agregar el producto', 
                error 
            });
        }
    },
    

    async update(req, res) {
        try {
            const { id } = req.params;
            const { codigo, nombre, precio, descripcion, talla, estado, imagen, genero_dirigido, id_Categoria } = req.body;
            const producto = await Producto.findByPk(id);
    
            if (!producto) {
                return res.status(404).json({ message: 'Producto no encontrado' });
            }
    
            await Producto.update(
                { codigo,nombre, precio, descripcion, talla, estado, imagen, genero_dirigido, id_Categoria },
                { where: { id } }
            );
    
            const productoActualizado = await Producto.findByPk(id);
            res.status(200).json(productoActualizado);
        } catch (error) {
            res.status(500).json({ message: 'Error al actualizar el producto', error });
        }
    },
    

    async delete(req, res) {
        try {
            const { codigo } = req.body; 
    
            if (!codigo) {
                return res.status(400).json({ message: 'Debe proporcionar un código para eliminar productos' });
            }
    
            const productos = await Producto.findAll({ where: { codigo } });
    
            if (productos.length > 0) {
                // Eliminar todos los productos encontrados
                await Producto.destroy({ where: { codigo } });
                res.status(200).json({ message: `Se eliminaron ${productos.length} producto(s) con el código: ${codigo}` });
            } else {
                res.status(404).json({ message: 'No se encontraron productos con el código especificado' });
            }
        } catch (error) {
            res.status(500).json({ message: 'Error al eliminar los productos', error: error.message });
        }
    }
    
};

export default ProductoController;

