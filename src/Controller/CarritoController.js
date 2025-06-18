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
<<<<<<< HEAD
<<<<<<< HEAD
                { model: Imagen, as: "imagenes", attributes: ["nomImagen"] }, // Obtener solo las imágenes
=======
                { model: Imagen, as: "imagenes", attributes: ["nomImagen"] },
>>>>>>> parent of e4de726a (cambios carrito)
=======
                { model: Imagen, as: "imagenes", attributes: ["nomImagen"] }, // Obtener solo las imágenes
>>>>>>> parent of 538b5f5d (Cambios a carrito)
            ],
        });

        if (!product) {
            return res.status(404).json({ message: "Producto no encontrado." });
        }

        const talla = await Talla.findByPk(tallaId);
        if (!talla) {
            return res.status(404).json({ message: "Talla no encontrada." });
        }

<<<<<<< HEAD
<<<<<<< HEAD
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
=======
        const existingProductIndex = cart.findIndex(p => p.id === product.id && p.tallaId === talla.id);
=======
        if (!req.session) {
            return res.status(500).json({ message: "Error en la sesión del usuario." });
        }
>>>>>>> parent of 538b5f5d (Cambios a carrito)

        req.session.cart = req.session.cart || [];

        const existingProductIndex = req.session.cart.findIndex(p => p.id === product.id && p.tallaId === talla.id);

        // Seleccionar la imagen del producto (usar la primera imagen si existen)
        const productImage = product.imagenes && product.imagenes.length > 0 ? product.imagenes[0].nomImagen : 'OIP.jpeg';

        if (existingProductIndex !== -1) {
            const currentQty = req.session.cart[existingProductIndex].quantity;

<<<<<<< HEAD
>>>>>>> parent of e4de726a (cambios carrito)
=======
            //Aquí se valida si se pasa de 5
>>>>>>> parent of 538b5f5d (Cambios a carrito)
            if (currentQty + qty > 5) {
                return res.status(400).json({
                    message: "No puedes agregar más de 5 unidades del mismo producto con la misma talla."
                });
            }

<<<<<<< HEAD
<<<<<<< HEAD
            req.session.cart[existingProductIndex].quantity += qty;
=======
            cart[existingProductIndex].quantity += qty;
>>>>>>> parent of e4de726a (cambios carrito)
=======
            req.session.cart[existingProductIndex].quantity += qty;
>>>>>>> parent of 538b5f5d (Cambios a carrito)
        } else {
            if (qty > 5) {
                return res.status(400).json({
                    message: "No puedes agregar más de 5 unidades del mismo producto con la misma talla."
                });
            }
<<<<<<< HEAD
<<<<<<< HEAD
            req.session.cart.push({
                id: product.id,
                nombre: product.nombre,
                precio: product.precio,
                imagen: productImage, // Asignar la imagen correcta
=======
            cart.push({
                id: product.id,
                nombre: product.nombre,
                precio: product.precio,
                imagen: productImage,
>>>>>>> parent of e4de726a (cambios carrito)
=======
            req.session.cart.push({
                id: product.id,
                nombre: product.nombre,
                precio: product.precio,
                imagen: productImage, // Asignar la imagen correcta
>>>>>>> parent of 538b5f5d (Cambios a carrito)
                tallaId: talla.id,
                tallaNombre: talla.nombre,
                quantity: qty,
                estado: product.estado
            });
        }

<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> parent of 538b5f5d (Cambios a carrito)
        req.session.save(err => {
            if (err) {
                console.error("Error guardando la sesión:", err);
                return res.status(500).json({ message: "Error guardando la sesión" });
            }
            res.json({ message: "Producto agregado al carrito", cart: req.session.cart });
        });
<<<<<<< HEAD
=======
        res.json({ message: "Producto agregado al carrito", cart });
>>>>>>> parent of e4de726a (cambios carrito)
=======
>>>>>>> parent of 538b5f5d (Cambios a carrito)

    } catch (error) {
        console.error("Error en addToCarrito:", error);
        res.status(500).json({ message: "Error en el servidor", error: error.message });
    }
};

<<<<<<< HEAD
<<<<<<< HEAD

export const getCarrito = async (req, res) => {
    console.log("Estado actual de la sesión en getCarrito:", req.session);

    try {
        if (!req.session) {
            return res.status(500).json({ message: "Error en la sesión del usuario." });
        }

        req.session.cart = req.session.cart || [];

        const updatedCart = [];

        for (const item of req.session.cart) {
    
            const productoDB = await Producto.findByPk(item.id);

            // Si el producto ya no existe, lo marcamos como no disponible
=======
=======

>>>>>>> parent of 538b5f5d (Cambios a carrito)
export const getCarrito = async (req, res) => {
    console.log("Estado actual de la sesión en getCarrito:", req.session);

    try {
        if (!req.session) {
            return res.status(500).json({ message: "Error en la sesión del usuario." });
        }

        req.session.cart = req.session.cart || [];

        const updatedCart = [];

        for (const item of req.session.cart) {
    
            const productoDB = await Producto.findByPk(item.id);
<<<<<<< HEAD
>>>>>>> parent of e4de726a (cambios carrito)
=======

            // Si el producto ya no existe, lo marcamos como no disponible
>>>>>>> parent of 538b5f5d (Cambios a carrito)
            const estadoActual = productoDB ? productoDB.estado : 'No disponible';

            updatedCart.push({
                ...item,
                estado: estadoActual  
            });
        }
<<<<<<< HEAD
<<<<<<< HEAD
        console.log("Carrito actualizado con estado real:", updatedCart);
=======
>>>>>>> parent of e4de726a (cambios carrito)
=======
        console.log("Carrito actualizado con estado real:", updatedCart);
>>>>>>> parent of 538b5f5d (Cambios a carrito)

        res.json({ cart: updatedCart });
    } catch (error) {
        console.error("Error en getCarrito:", error);
        res.status(500).json({ message: "Error en el servidor", error: error.message });
    }
};

<<<<<<< HEAD
<<<<<<< HEAD



export const removeFromCarrito = (req, res) => {
    try {
        const { productId, tallaId } = req.body;
        if (!req.session.cart || req.session.cart.length === 0) {
=======
export const removeFromCarrito = (req, res) => {
    try {
        const { productId, tallaId, cart = [] } = req.body;
        
        if (!cart || cart.length === 0) {
>>>>>>> parent of e4de726a (cambios carrito)
=======



export const removeFromCarrito = (req, res) => {
    try {
        const { productId, tallaId } = req.body;
        if (!req.session.cart || req.session.cart.length === 0) {
>>>>>>> parent of 538b5f5d (Cambios a carrito)
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

<<<<<<< HEAD
<<<<<<< HEAD
};
=======
>>>>>>> parent of e4de726a (cambios carrito)
=======
};
>>>>>>> parent of 538b5f5d (Cambios a carrito)
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
<<<<<<< HEAD
<<<<<<< HEAD
=======

>>>>>>> parent of e4de726a (cambios carrito)
=======
>>>>>>> parent of 538b5f5d (Cambios a carrito)
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
