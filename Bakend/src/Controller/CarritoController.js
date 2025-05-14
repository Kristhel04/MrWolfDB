import Producto from "../model/ProductoModel.js";
import Imagen from "../model/ImagenModel.js";
import Talla from "../model/TallaModel.js";
import ProductoTalla from "../model/ProductoTallaModel.js";
import { Sequelize } from "sequelize";

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

        // Incluir imágenes en la consulta del producto
        const product = await Producto.findByPk(productId, {
            include: [
                { model: Imagen, as: "imagenes", attributes: ["nomImagen"] }, // Obtener solo las imágenes
            ],
        });

        if (!product) {
            return res.status(404).json({ message: "Producto no encontrado." });
        }

        const talla = await Talla.findByPk(tallaId);
        if (!talla) {
            return res.status(404).json({ message: "Talla no encontrada." });
        }

        if (!req.session) {
            return res.status(500).json({ message: "Error en la sesión del usuario." });
        }

        req.session.cart = req.session.cart || [];

        const existingProductIndex = req.session.cart.findIndex(p => p.id === product.id && p.tallaId === talla.id);

        // Seleccionar la imagen del producto (usar la primera imagen si existen)
        const productImage = product.imagenes && product.imagenes.length > 0 ? product.imagenes[0].nomImagen : 'OIP.jpeg';

        if (existingProductIndex !== -1) {
            const currentQty = req.session.cart[existingProductIndex].quantity;

            //Aquí se valida si se pasa de 5
            if (currentQty + qty > 5) {
                return res.status(400).json({
                    message: "No puedes agregar más de 5 unidades del mismo producto con la misma talla."
                });
            }

            req.session.cart[existingProductIndex].quantity += qty;
        } else {
            if (qty > 5) {
                return res.status(400).json({
                    message: "No puedes agregar más de 5 unidades del mismo producto con la misma talla."
                });
            }
            req.session.cart.push({
                id: product.id,
                nombre: product.nombre,
                precio: product.precio,
                imagen: productImage, // Asignar la imagen correcta
                tallaId: talla.id,
                tallaNombre: talla.nombre,
                quantity: qty
            });
        }

        req.session.save(err => {
            if (err) {
                console.error("Error guardando la sesión:", err);
                return res.status(500).json({ message: "Error guardando la sesión" });
            }
            res.json({ message: "Producto agregado al carrito", cart: req.session.cart });
        });

    } catch (error) {
        console.error("Error en addToCarrito:", error);
        res.status(500).json({ message: "Error en el servidor", error: error.message });
    }
};



export const getCarrito = (req, res) => {
    console.log("Estado actual de la sesión en getCarrito:", req.session);

    try {
        if (!req.session) {
            return res.status(500).json({ message: "Error en la sesión del usuario." });
        }

        req.session.cart = req.session.cart || [];

        console.log("Carrito en getCarrito después de inicialización:", req.session.cart);

        res.json({ cart: req.session.cart });
    } catch (error) {
        console.error("Error en getCarrito:", error);
        res.status(500).json({ message: "Error en el servidor", error: error.message });
    }
};



export const removeFromCarrito = (req, res) => {
    try {
        const { productId, tallaId } = req.body;
        if (!req.session.cart || req.session.cart.length === 0) {
            return res.status(400).json({ message: 'El carrito está vacío' });
        }

        const initialLength = req.session.cart.length;
        req.session.cart = req.session.cart.filter(p => !(p.id === productId && p.tallaId === tallaId));

        if (req.session.cart.length === initialLength) {
            return res.status(404).json({ message: 'Producto no encontrado en el carrito' });
        }

        res.json({ message: 'Producto eliminado', cart: req.session.cart });
    } catch (error) {
        res.status(500).json({ message: 'Error en el servidor', error });
    }

};
export const updateCarrito = async (req, res) => {
    try {
        const { productId, tallaId, quantity } = req.body;

        if (!productId || !tallaId || isNaN(productId) || isNaN(tallaId)) {
            return res.status(400).json({ message: "Datos inválidos: productId y tallaId son requeridos y deben ser números." });
        }

        const qty = parseInt(quantity, 10);
        if (isNaN(qty) || qty <= 0) {
            return res.status(400).json({ message: "Cantidad inválida: debe ser un número mayor a 0." });
        }

        if (!req.session || !req.session.cart) {
            return res.status(400).json({ message: "El carrito está vacío." });
        }

        const productIndex = req.session.cart.findIndex(p => p.id === productId && p.tallaId === tallaId);
        if (productIndex === -1) {
            return res.status(404).json({ message: "Producto no encontrado en el carrito." });
        }
        
        req.session.cart[productIndex].quantity = qty;

        req.session.save(err => {
            if (err) {
                console.error("Error guardando la sesión:", err);
                return res.status(500).json({ message: "Error guardando la sesión" });
            }
            res.json({ 
                message: "Cantidad actualizada", 
                cart: req.session.cart
            });
        });

    } catch (error) {
        console.error("Error en updateCarrito:", error);
        res.status(500).json({ message: "Error en el servidor", error: error.message });
    }
    
};
export const removeMultipleFromCarrito = (req, res) => {
    try {
        const { productos } = req.body;

        if (!Array.isArray(productos) || productos.length === 0) {
            return res.status(400).json({ message: "Se requiere una lista de productos para eliminar." });
        }

        if (!req.session || !req.session.cart) {
            return res.status(400).json({ message: "El carrito está vacío o no existe." });
        }

        // Filtrar productos que no estén en la lista de productos a eliminar
        req.session.cart = req.session.cart.filter(cartItem => {
            return !productos.some(p => p.id === cartItem.id && p.tallaId === cartItem.tallaId);
        });

        req.session.save(err => {
            if (err) {
                console.error("Error guardando la sesión:", err);
                return res.status(500).json({ message: "Error guardando la sesión" });
            }
            res.json({ message: "Productos eliminados del carrito", cart: req.session.cart });
        });
    } catch (error) {
        console.error("Error en removeMultipleFromCarrito:", error);
        res.status(500).json({ message: "Error en el servidor", error: error.message });
    }
};
