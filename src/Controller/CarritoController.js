import Producto from "../model/ProductoModel.js";
import Imagen from "../model/ImagenModel.js";
import Talla from "../model/TallaModel.js";
import ProductoTalla from "../model/ProductoTallaModel.js";
import { Sequelize } from "sequelize";

// Función para agregar al carrito
export const addToCarrito = async (req, res) => {
    try {
        const { productId, tallaId, quantity = 1, cart = [] } = req.body;

        if (!productId || !tallaId || isNaN(productId) || isNaN(tallaId)) {
            return res.status(400).json({ message: "Datos inválidos: productId y tallaId son requeridos y deben ser números." });
        }

        const qty = parseInt(quantity, 10);
        if (isNaN(qty) || qty <= 0) {
            return res.status(400).json({ message: "Cantidad inválida: debe ser un número mayor a 0." });
        }

        // Incluir imágenes en la consulta del producto
        const product = await Producto.findByPk(productId, {
            include: [
                { model: Imagen, as: "imagenes", attributes: ["nomImagen"] },
            ],
        });

        if (!product) {
            return res.status(404).json({ message: "Producto no encontrado." });
        }

        const talla = await Talla.findByPk(tallaId);
        if (!talla) {
            return res.status(404).json({ message: "Talla no encontrada." });
        }

        const existingProductIndex = cart.findIndex(p => p.id === product.id && p.tallaId === talla.id);

        // Seleccionar la imagen del producto
        const productImage = product.imagenes && product.imagenes.length > 0 ? product.imagenes[0].nomImagen : 'OIP.jpeg';

        if (existingProductIndex !== -1) {
            const currentQty = cart[existingProductIndex].quantity;

            if (currentQty + qty > 5) {
                return res.status(400).json({
                    message: "No puedes agregar más de 5 unidades del mismo producto con la misma talla."
                });
            }

            cart[existingProductIndex].quantity += qty;
        } else {
            if (qty > 5) {
                return res.status(400).json({
                    message: "No puedes agregar más de 5 unidades del mismo producto con la misma talla."
                });
            }
            cart.push({
                id: product.id,
                nombre: product.nombre,
                precio: product.precio,
                imagen: productImage,
                tallaId: talla.id,
                tallaNombre: talla.nombre,
                quantity: qty,
                estado: product.estado
            });
        }

        res.json({ message: "Producto agregado al carrito", cart });

    } catch (error) {
        console.error("Error en addToCarrito:", error);
        res.status(500).json({ message: "Error en el servidor", error: error.message });
    }
};

export const getCarrito = async (req, res) => {
    try {
        const { cart = [] } = req.body;
        const updatedCart = [];

        for (const item of cart) {
            const productoDB = await Producto.findByPk(item.id);
            const estadoActual = productoDB ? productoDB.estado : 'No disponible';

            updatedCart.push({
                ...item,
                estado: estadoActual  
            });
        }

        res.json({ cart: updatedCart });
    } catch (error) {
        console.error("Error en getCarrito:", error);
        res.status(500).json({ message: "Error en el servidor", error: error.message });
    }
};

export const removeFromCarrito = (req, res) => {
    try {
        const { productId, tallaId, cart = [] } = req.body;
        
        if (!cart || cart.length === 0) {
            return res.status(400).json({ message: 'El carrito está vacío' });
        }

        const initialLength = cart.length;
        const updatedCart = cart.filter(p => !(p.id === productId && p.tallaId === tallaId));

        if (updatedCart.length === initialLength) {
            return res.status(404).json({ message: 'Producto no encontrado en el carrito' });
        }

        res.json({ message: 'Producto eliminado', cart: updatedCart });
    } catch (error) {
        res.status(500).json({ message: 'Error en el servidor', error });
    }
};

export const updateCarrito = async (req, res) => {
    try {
        const { productId, tallaId, quantity, cart = [] } = req.body;

        if (!productId || !tallaId || isNaN(productId) || isNaN(tallaId)) {
            return res.status(400).json({ message: "Datos inválidos: productId y tallaId son requeridos y deben ser números." });
        }

        const qty = parseInt(quantity, 10);
        if (isNaN(qty) || qty <= 0) {
            return res.status(400).json({ message: "Cantidad inválida: debe ser un número mayor a 0." });
        }

        if (!cart || cart.length === 0) {
            return res.status(400).json({ message: "El carrito está vacío." });
        }

        const productIndex = cart.findIndex(p => p.id === productId && p.tallaId === tallaId);
        if (productIndex === -1) {
            return res.status(404).json({ message: "Producto no encontrado en el carrito." });
        }
        
        const updatedCart = [...cart];
        updatedCart[productIndex].quantity = qty;

        res.json({ 
            message: "Cantidad actualizada", 
            cart: updatedCart
        });

    } catch (error) {
        console.error("Error en updateCarrito:", error);
        res.status(500).json({ message: "Error en el servidor", error: error.message });
    }
};

export const removeMultipleFromCarrito = (req, res) => {
    try {
        const { productos, cart = [] } = req.body;

        if (!Array.isArray(productos) || productos.length === 0) {
            return res.status(400).json({ message: "Se requiere una lista de productos para eliminar." });
        }

        if (!cart || cart.length === 0) {
            return res.status(400).json({ message: "El carrito está vacío o no existe." });
        }

        const updatedCart = cart.filter(cartItem => {
            return !productos.some(p => p.id === cartItem.id && p.tallaId === cartItem.tallaId);
        });

        res.json({ message: "Productos eliminados del carrito", cart: updatedCart });
    } catch (error) {
        console.error("Error en removeMultipleFromCarrito:", error);
        res.status(500).json({ message: "Error en el servidor", error: error.message });
    }
};
