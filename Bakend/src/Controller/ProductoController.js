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
                res.status(404).json({ message: 'Categoría no encontrada' });
            }
        } catch (error) {
            res.status(500).json({ message: 'Error al obtener el producto', error });
        }
    },
};

export default ProductoController;

