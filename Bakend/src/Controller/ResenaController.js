// src/controller/ReseñaController.js
import Resena from "../model/ResenaModel.js";
import Usuario from "../model/UsuarioModel.js";
import Producto from "../model/ProductoModel.js";
import moment from 'moment';
import { authenticateToken } from '../Middleware/JwtAuth.js';  // Importar el middleware

const ResenaController = {
  // Obtener todas las reseñas con usuario y producto
  async getAll(req, res) {
    try {
      console.log('Buscando reseñas...');
      const resenas = await Resena.findAll({
        include: [
          { model: Usuario, as: "usuario", attributes: ["cedula", "nombre_usuario", "nombre_completo"] },
          { model: Producto, as: "producto", attributes: ["id", "nombre"] }
        ],
      });
      console.log(resenas); 
      res.status(200).json(resenas);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener las reseñas", error });
    }
  },

  // Obtener reseñas por ID de producto
  async getResenasByProducto(req, res) {
    try {
        const { id } = req.params;

        const productoResenas = await Resena.findAll({
            where: { id_producto: id },
            include: [
                {
                    model: Usuario,
                    as: 'usuario',
                    attributes: ['cedula', 'nombre_usuario', 'nombre_completo'] 
                },
                {
                    model: Producto,
                    as: 'producto',
                    attributes: ['id', 'nombre'] 
                }
            ],
        });
        if (productoResenas.length === 0) {
            return res.status(404).json({ message: "No se encontraron reseñas para este producto" });
        }

        res.status(200).json(productoResenas);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener las reseñas del producto", error });
    }
},

   // Crear nueva reseña (requiere autenticación)
   async create(req, res) {
    try {
      const { cedula } = req.user;  // Ya está verificado y decodificado por el middleware
  
      const { id_producto, calificacion, comentario } = req.body;
  
      // Solo se usa la fecha sin hora
      const fechaFormateada = moment().format('YYYY-MM-DD'); 
      const nuevaResena = await Resena.create({
        cedula_usuario: cedula,
        id_producto,
        calificacion,
        comentario,
        fecha: fechaFormateada
      });
  
      res.status(201).json({
        message: "Reseña creada correctamente",
        resena: nuevaResena
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al crear reseña", error });
    }    
  },
  
  // Eliminar reseña
    async delete(req, res) {
      try {
        const { id } = req.params;
        const resena = await Resena.findByPk(id);
  
        if (!resena) {
          return res.status(404).json({ message: "Reseña no encontrada" });
        }
        await resena.destroy();
  
        res.status(200).json({ message: "Reseña eliminada correctamente" });
      } catch (error) {
        res.status(500).json({ message: "Error al eliminar la reseña", error });
      }
    }
};

export default ResenaController;
