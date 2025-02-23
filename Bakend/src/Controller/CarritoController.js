import Carrito from "../model/CarritoModel.js";
import Producto from "../model/ProductoModel.js";

const CarritoController = {
    // Obtener los productos en el carrito de un usuario
    async getCarrito(req, res) {
        try {
            const { usuarioId } = req.params;
            const carrito = await Carrito.findAll({
                where: { usuarioId },
                include: [Producto]
            });
            res.status(200).json(carrito);
        } catch (error) {
            res.status(500).json({ message: 'Error al obtener el carrito', error });
        }
    },

    // Agregar un producto al carrito
    async addToCarrito(req, res) {
        try {
            const { usuarioId, productoId, cantidad } = req.body;

            // Verificar si el producto ya está en el carrito
            const productoExistente = await Carrito.findOne({
                where: { usuarioId, productoId }
            });

            if (productoExistente) {
                // Si ya existe, actualizar la cantidad
                productoExistente.cantidad += cantidad;
                await productoExistente.save();
            } else {
                // Si no existe, crear un nuevo registro
                await Carrito.create({ usuarioId, productoId, cantidad });
            }

            res.status(200).json({ message: 'Producto agregado al carrito' });
        } catch (error) {
            res.status(500).json({ message: 'Error al agregar al carrito', error });
        }
    },

    // Eliminar un producto del carrito
    async removeFromCarrito(req, res) {
        try {
            const { id } = req.params;
            await Carrito.destroy({ where: { id } });
            res.status(200).json({ message: 'Producto eliminado del carrito' });
        } catch (error) {
            res.status(500).json({ message: 'Error al eliminar producto del carrito', error });
        }
    },

    // Vaciar el carrito de un usuario
    async clearCarrito(req, res) {
        try {
            const { usuarioId } = req.params;
            await Carrito.destroy({ where: { usuarioId } });
            res.status(200).json({ message: 'Carrito vaciado' });
        } catch (error) {
            res.status(500).json({ message: 'Error al vaciar el carrito', error });
        }
    }
};

export default CarritoController;
