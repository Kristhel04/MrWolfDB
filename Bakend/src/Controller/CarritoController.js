import Carrito from "../model/CarritoModel.js";
import Producto from "../model/ProductoModel.js";
const calcularTotal = (precio, cantidad) => {
    return precio * cantidad;
};

const CarritoController = {
    // Obtener el carrito de un usuario desde la base de datos
    async getCarrito(req, res) {
        try {
            const usuarioId = Number(req.params.usuarioId); // Asegúrate de que sea un número

            if (isNaN(usuarioId)) {
                return res.status(400).json({ error: 'El usuarioId debe ser un número' });
            }

            const carrito = await Carrito.findAll({
                where: { usuarioId },
                include: [{
                    model: Producto,
                    attributes: ['nombre', 'precio', 'talla', 'imagen'] // Incluir imagen
                }]
            });

            if (carrito.length === 0) {
                return res.status(404).json({ message: 'Carrito no encontrado para este usuario' });
            }

            // Mapear los productos del carrito para incluir solo los campos necesarios y calcular el total
            const productosCarrito = carrito.map(item => {
                const total = calcularTotal(item.Producto.precio, item.cantidad); // Usar la función para calcular el total
                return {
                    nombre: item.Producto.nombre,
                    precio: item.Producto.precio,
                    talla: item.Producto.talla,
                    imagen: item.Producto.imagen,
                    cantidad: item.cantidad,
                    total // Agregar el total calculado
                };
            });

            res.json(productosCarrito);
        } catch (error) {
            console.error('Error al obtener el carrito:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    },
    

    // Agregar un producto al carrito
    async addToCarrito(req, res) {
        try {
            const { usuarioId, productoId, cantidad } = req.body;
    
            // Validar que usuarioId, productoId y cantidad sean válidos
            if (!usuarioId || !productoId || cantidad <= 0) {
                return res.status(400).json({ message: 'Datos inválidos' });
            }
    
            // Verificar si el producto ya está en el carrito
            const productoExistente = await Carrito.findOne({
                where: { usuarioId, productoId }
            });
    
            if (productoExistente) {
                // Si el producto ya existe, actualizar la cantidad
                productoExistente.cantidad += cantidad;
                await productoExistente.save();
            } else {
                // Si no existe, crear un nuevo registro en el carrito
                await Carrito.create({
                    usuarioId,
                    productoId,
                    cantidad // Asegurarse de que la cantidad se almacene
                });
            }
    
            // Responder con un mensaje de éxito
            res.status(200).json({ message: 'Producto agregado al carrito' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al agregar al carrito', error: error.message });
        }
    },
        
// Modificar la cantidad de un producto en el carrito
async updateCarrito(req, res) {
    try {
        const { usuarioId, productoId, cantidad } = req.body;

        // Validar datos de entrada
        if (!usuarioId || !productoId || cantidad < 0) {
            return res.status(400).json({ message: 'Datos inválidos' });
        }

        // Buscar el producto en el carrito
        const producto = await Carrito.findOne({
            where: { usuarioId, productoId }
        });

        if (!producto) {
            return res.status(404).json({ message: 'Producto no encontrado en el carrito' });
        }

        // Obtener el precio del producto
        const precio = producto.precio; // Verifica que este campo exista

        // Lógica para manejar la cantidad
        if (cantidad === 0) {
            // Eliminar el producto del carrito si la cantidad es 0
            await producto.destroy();
        } else {
            // Actualizar la cantidad
            producto.cantidad = cantidad;
            producto.total = calcularTotal(precio, cantidad); // Usa el precio obtenido
            await producto.save();
        }

        res.status(200).json({ message: 'Carrito actualizado', producto });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar el carrito', error: error.message });
    }
},


    // Eliminar un producto del carrito
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

    // Vaciar el carrito de un usuario
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