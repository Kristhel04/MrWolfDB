import {Router} from 'express';
import  { addToCarrito, getCarrito, removeFromCarrito }from '../Controller/CarritoController.js';

const router = Router();

router.post("/cart/add", addToCarrito);       // Agregar producto al carrito
router.get("/cart", getCarrito);              // Obtener el carrito
router.delete("/cart/remove", removeFromCarrito); // Eliminar producto del carrito


export default router;
