import Producto from "../model/ProductoModel.js";
import Talla from "../model/TallaModel.js";

exports.addToCarrito = async (req, res) => {
    try {
        const { productId, tallaId, quantity = 1 } = req.body;
        const qty = parseInt(quantity, 10);
        if (isNaN(qty) || qty <= 0) {
            return res.status(400).json({ message: 'Cantidad inválida' });
        }

        const product = await Producto.findByPk(productId);
        if (!product) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        const talla = await Talla.findByPk(tallaId);
        if (!talla) {
            return res.status(404).json({ message: 'Talla no encontrada' });
        }

        req.session.cart = req.session.cart || [];

        const existingProductIndex = req.session.cart.findIndex(p => p.id === productId && p.tallaId === tallaId);
        if (existingProductIndex !== -1) {
            req.session.cart[existingProductIndex] = {
                ...req.session.cart[existingProductIndex],
                quantity: req.session.cart[existingProductIndex].quantity + qty
            };
        } else {
            req.session.cart.push({
                id: product.id,
                nombre: product.nombre,
                precio: product.precio,
                imagen: product.imagen,
                tallaId: talla.id,
                tallaNombre: talla.nombre,
                quantity: qty
            });
        }

        res.json({ message: 'Producto agregado al carrito', cart: req.session.cart });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error en el servidor', error });
    }
};

exports.getCarrito = (req, res) => {
    req.session.cart = req.session.cart || [];
    res.json(req.session.cart);
};

exports.removeFromCarrito = (req, res) => {
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
