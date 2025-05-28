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
  
// Editar reseña (solo si es del usuario)
async update(req, res) {
  try {
    const { id } = req.params;
    const { comentario, calificacion } = req.body;
    const { cedula, rol } = req.user;

    const resena = await Resena.findByPk(id);
    if (!resena) {
      return res.status(404).json({ message: "Reseña no encontrada" });
    }

    if (resena.cedula_usuario !== cedula) {
      return res.status(403).json({ message: "No tienes permiso para modificar esta reseña" });
    }

    resena.comentario = comentario || resena.comentario;
    resena.calificacion = calificacion || resena.calificacion;
    await resena.save();

    res.status(200).json({ message: "Reseña actualizada correctamente", resena });
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar la reseña", error });
  }
},

// Eliminar reseña (usuario dueño o admin)
async delete(req, res) {
  try {
    const { id } = req.params;
    const { cedula, rol } = req.user;

    const resena = await Resena.findByPk(id);
    if (!resena) {
      return res.status(404).json({ message: "Reseña no encontrada" });
    }

   if (rol !== 'Administrador' && resena.cedula_usuario !== cedula){
      return res.status(403).json({ message: "No tienes permiso para eliminar esta reseña" });
    }

    await resena.destroy();
    res.status(200).json({ message: "Reseña eliminada correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar la reseña", error });
  }
},

// Obtener puntuación promedio por producto
async getPuntuacionPromedio(req, res) {
  try {
    const { id } = req.params;

    const reseñas = await Resena.findAll({
      where: {
        id_producto: id
      }
    });

    if (!reseñas.length) {
      return res.status(404).json({ message: "No hay reseñas para este producto" });
    }

    const total = reseñas.reduce((sum, r) => sum + r.calificacion, 0);
    const promedio = total / reseñas.length;

    res.status(200).json({
      id_producto: id,
      promedio: promedio.toFixed(2),
      cantidad: reseñas.length
    });
  } catch (error) {
    res.status(500).json({ message: "Error al calcular la puntuación", error });
  }
}

};

export default ResenaController;
