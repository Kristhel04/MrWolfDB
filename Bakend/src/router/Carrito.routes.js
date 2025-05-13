import {Router} from 'express';
import  { addToCarrito, getCarrito, removeFromCarrito,updateCarrito,removeMultipleFromCarrito}from '../Controller/CarritoController.js';

const router = Router();

router.post("/cart/add", addToCarrito);       
router.get("/cart", getCarrito);              
router.delete("/cart/remove", removeFromCarrito); 
router.put("/cart/update",updateCarrito);
router.delete("/cart/remove-multiple", removeMultipleFromCarrito);

export default router;
