import Carrito from "../model/CarritoModel.js";
import Producto from "../model/ProductoModel.js";
import ProductoTalla from "../model/ProductoTallaModel.js"; // Importar la tabla intermedia

const calcularTotal = (precio, cantidad) => precio * cantidad;

const CarritoController = {
    async getCarrito(req, res) {
        try {
            const usuarioId = Number(req.params.usuarioId);

            if (isNaN(usuarioId)) {
                return res.status(400).json({ error: 'El usuarioId debe ser un número' });
            }
            const carrito = await Carrito.findAll({
                where: { usuarioId },
                include: [{
                    model: Producto,
                    attributes: ['nombre', 'precio', 'imagen'],
                    include: [{
                        model: ProductoTalla,
                        attributes: ['talla']
                    }]
                }]
            });

            if (carrito.length === 0) {
                return res.status(404).json({ message: 'Carrito no encontrado para este usuario' });
            }

            const productosCarrito = carrito.map(item => {
                const total = calcularTotal(item.Producto.precio, item.cantidad);
                return {
                    nombre: item.Producto.nombre,
                    precio: item.Producto.precio,
                    talla: item.Producto.ProductoTalla?.talla || 'No disponible',
                    imagen: item.Producto.imagen,
                    cantidad: item.cantidad,
                    total
                };
            });

            res.json(productosCarrito);
        } catch (error) {
            console.error('Error al obtener el carrito:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    },

    async addToCarrito(req, res) {
        try {
            const { usuarioId, productoId, cantidad } = req.body;

            if (!usuarioId || !productoId || cantidad <= 0) {
                return res.status(400).json({ message: 'Datos inválidos' });
            }

            const productoExistente = await Carrito.findOne({
                where: { usuarioId, productoId }
            });
            
            if (productoExistente) {
                productoExistente.cantidad += cantidad;
                await productoExistente.save();
            } else {
                await Carrito.create({ usuarioId, productoId, cantidad });
            }
            
            res.status(200).json({ message: 'Producto agregado al carrito' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al agregar al carrito', error: error.message });
        }
    },

    async updateCarrito(req, res) {
        try {
            const { productoId, cantidad } = req.body;

            if (!productoId || cantidad == null || cantidad < 1) {
                return res.status(400).json({ error: "Datos inválidos" });
            }

            const productoEnCarrito = await Carrito.findOne({ where: { productoId } });

            if (!productoEnCarrito) {
                return res.status(404).json({ error: "Producto no encontrado en el carrito" });
            }

            await productoEnCarrito.update({ cantidad });

            res.json({ message: "Cantidad actualizada correctamente" });
        } catch (error) {
            res.status(500).json({ error: "Error en el servidor" });
        }
    },

    async removeFromCarrito(req, res) {
        try {
            const { usuarioId, productoId } = req.body;

            const eliminado = await Carrito.destroy({
                where: { usuarioId, productoId }
            });

            if (!eliminado) {
                return res.status(404).json({ message: 'Producto no encontrado en el carrito' });
            }

            res.status(200).json({ message: 'Producto eliminado del carrito' });
        } catch (error) {
            res.status(500).json({ message: 'Error al eliminar producto del carrito', error: error.message });
        }
    },

    async clearCarrito(req, res) {
        try {
            const { usuarioId } = req.params;

            const eliminado = await Carrito.destroy({
                where: { usuarioId }
            });

            if (!eliminado) {
                return res.status(404).json({ message: 'Carrito no encontrado' });
            }

            res.status(200).json({ message: 'Carrito vaciado' });
        } catch (error) {
            res.status(500).json({ message: 'Error al vaciar el carrito', error: error.message });
        }
    }
};

export default CarritoController;