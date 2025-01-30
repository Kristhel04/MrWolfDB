import Producto from "../model/ProductoModel";

const ProductoController = {

    async getAll(req, res) {
        try {
            const productos = await Producto.findAll();
            res.status(200).json(productos);
        } catch (error) {
            res.status(500).json({ message: 'Error al obtener los productos', error });
        }
    },

    async getById(req, res) {
        try {
            const { id } = req.params;
            const producto = await Producto.findByPk(id);
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
            const { nombre, precio, descripcion, talla, estado, imagen, genero_dirigido, id_Categoria} = req.body;
            const nuevaProducto = await Producto.create({
                 nombre, 
                 precio,
                 descripcion,
                 talla,
                 estado,
                imagen,
                genero_dirigido,
                id_Categoria
                });
            res.status(201).json(nuevaProducto);
        } catch (error) {
            res.status(500).json({ message: 'Error al agregar el producto', error });
        }
    },

    async update(req, res) {
        try {
            const { id } = req.params;
            const { nombre, precio, descripcion, talla, estado, imagen, genero_dirigido, id_Categoria } = req.body;
            const producto = await Producto.findByPk(id);
    
            if (!producto) {
                return res.status(404).json({ message: 'Producto no encontrado' });
            }
    
            await Producto.update(
                { nombre, precio, descripcion, talla, estado, imagen, genero_dirigido, id_Categoria },
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
            const { id } = req.params;
            const producto = await Producto.findByPk(id);
            if (producto) {
                await producto.destroy();
                res.status(200).json({ message: 'Producto eliminado correctamente' });
            } else {
                res.status(404).json({ message: 'Producto no encontrado' });
            }
        } catch (error) {
            res.status(500).json({ message: 'Error al eliminar el Producto', error });
        }
    }
};

export default ProductoController;

