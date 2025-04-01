import Producto from "../model/ProductoModel.js";
import Talla from "../model/TallaModel.js";

export const addToCarrito = async (req, res) => {
    try {
        const { productId, tallaId, quantity = 1 } = req.body;

        // Validar que productId y tallaId sean números válidos
        if (!productId || !tallaId || isNaN(productId) || isNaN(tallaId)) {
            return res.status(400).json({ message: "Datos inválidos: productId y tallaId son requeridos y deben ser números." });
        }

        // Convertir la cantidad a número entero y validar que sea mayor a 0
        const qty = parseInt(quantity, 10);
        if (isNaN(qty) || qty <= 0) {
            return res.status(400).json({ message: "Cantidad inválida: debe ser un número mayor a 0." });
        }

        // Buscar el producto en la base de datos
        const product = await Producto.findByPk(productId);
        if (!product) {
            return res.status(404).json({ message: "Producto no encontrado." });
        }

        // Buscar la talla en la base de datos
        const talla = await Talla.findByPk(tallaId);
        console.log("Talla encontrada:", talla);
        if (!talla) {
            return res.status(404).json({ message: "Talla no encontrada." });
        }

        // Verificar que la sesión existe antes de acceder al carrito
        if (!req.session) {
            return res.status(500).json({ message: "Error en la sesión del usuario." });
        }

        // Inicializar el carrito si no existe
        req.session.cart = req.session.cart || [];

        // Buscar si el producto ya está en el carrito con la misma talla
        const existingProductIndex = req.session.cart.findIndex(p => p.id === product.id && p.tallaId === talla.id);

        if (existingProductIndex !== -1) {
            // Si el producto ya está en el carrito, aumentar la cantidad
            req.session.cart[existingProductIndex].quantity += qty;
        } else {
            // Agregar nuevo producto al carrito
            req.session.cart.push({
                id: product.id,
                nombre: product.nombre,
                precio: product.precio,
                imagen: product.imagen || null, // Evita error si `imagen` es undefined
                tallaId: talla.id,
                tallaNombre: talla.nombre,
                quantity: qty
            });
        }

        // Enviar respuesta con el carrito actualizado
        res.json({ message: "Producto agregado al carrito", cart: req.session.cart });

    } catch (error) {
        console.error("Error en addToCarrito:", error);
        res.status(500).json({ message: "Error en el servidor", error: error.message });
    }
};

export const getCarrito = (req, res) => {
    req.session.cart = req.session.cart || [];
    res.json(req.session.cart);
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
