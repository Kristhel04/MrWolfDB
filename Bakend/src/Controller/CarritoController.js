import Producto from "../model/ProductoModel.js";
import Talla from "../model/TallaModel.js";

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

        const product = await Producto.findByPk(productId);
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

        if (existingProductIndex !== -1) {
            req.session.cart[existingProductIndex].quantity += qty;
        } else {
            req.session.cart.push({
                id: product.id,
                nombre: product.nombre,
                precio: product.precio,
                imagen: product.imagen || null,
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
            console.log("Sesión guardada correctamente:", req.session);
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
