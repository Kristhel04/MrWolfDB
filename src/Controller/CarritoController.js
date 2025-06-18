import Producto from "../model/ProductoModel.js";
import Imagen from "../model/ImagenModel.js";
import Talla from "../model/TallaModel.js";

// Función para agregar al carrito
export const addToCarrito = async (req, res) => {
    try {
        const { productId, tallaId, quantity = 1 } = req.body;

        if (!productId || !tallaId || isNaN(productId) || isNaN(tallaId)) {
            return res.status(400).json({ message: "Datos inválidos: productId y tallaId son requeridos y deben ser números." });
        }

        const qty = parseInt(quantity, 10);
        if (isNaN(qty) || qty <= 0) {
            return res.status(400).json({ message: "Cantidad inválida: debe ser un número mayor a 0." });
        }

        // Obtener el producto y talla
        const product = await Producto.findByPk(productId, {
            include: [{ model: Imagen, as: "imagenes", attributes: ["nomImagen"] }],
        });

        if (!product) {
            return res.status(404).json({ message: "Producto no encontrado." });
        }

        const talla = await Talla.findByPk(tallaId);
        if (!talla) {
            return res.status(404).json({ message: "Talla no encontrada." });
        }

        // Aquí ya no es necesario manejar el carrito en la sesión o base de datos
        // El carrito se maneja completamente en el frontend con localStorage/sessionStorage
        res.json({ message: "Producto agregado al carrito", cart: req.body.cart || [] });

    } catch (error) {
        console.error("Error en addToCarrito:", error);
        res.status(500).json({ message: "Error en el servidor", error: error.message });
    }
};

// Función para obtener el carrito (con localStorage/sessionStorage)
export const getCarrito = (req, res) => {
    try {
        const cart = req.body.cart || [];
        res.json({ cart });
    } catch (error) {
        console.error("Error en getCarrito:", error);
        res.status(500).json({ message: "Error en el servidor", error: error.message });
    }
};

// Función para eliminar del carrito
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

// Función para actualizar cantidad en el carrito
export const updateCarrito = (req, res) => {
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

// Función para eliminar múltiples productos del carrito
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
