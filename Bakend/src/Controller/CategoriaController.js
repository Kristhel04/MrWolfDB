import fs from "fs";
import path from "path";
import multer from "multer";
import Categoria from "../model/CategoriaModel.js";

// Definir la carpeta de almacenamiento
const uploadDir = path.join("public", "ImgCategorias");

// Verificar si la carpeta existe, si no, crearla
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuración de multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const filename = `${Date.now()}${ext}`;
        cb(null, filename);
    }
});

//Fintro para que solo se acepten imagenes 
const fileFilter = (req, file, cb) => {
    const allowedExtensions = [".jpg", ".jpeg", ".png"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowedExtensions.includes(ext)) {
        return cb(new Error("Formato de archivo no permitido"), false);
    }
    cb(null, true);
};

//Subida de la imagen al storage
const upload = multer({ storage, fileFilter }).single("imagen");


const CategoriaController = {
    
    async getAll(req, res) {
        try {
            const categorias = await Categoria.findAll();
            const categoriasConImagenURL = categorias.map(categoria => ({
                ...categoria.dataValues,
                imagen: categoria.imagen ? `http://localhost:3000/imagenes/${categoria.imagen}` : null
            }));
    
            res.status(200).json(categoriasConImagenURL);
        } catch (error) {
            res.status(500).json({ message: "Error al obtener las categorías", error });
        }
    },
    
    async getById(req, res) {
        try {
            const { id } = req.params;
            const categoria = await Categoria.findByPk(id);
            if (categoria) {
                categoria.imagen = categoria.imagen ? `http://localhost:3000/imagenes/${categoria.imagen}` : null;
                res.status(200).json(categoria);
            } else {
                res.status(404).json({ message: "Categoría no encontrada" });
            }
        } catch (error) {
            res.status(500).json({ message: "Error al obtener la categoría", error });
        }
    },

    // Crear una nueva categoría 
    async create(req, res) {
        upload(req, res, async (err) => {
            if (err) {
                return res.status(400).json({ message: err.message });
            }
            try {
                const { nombre_categoria, descripcion_categoria } = req.body;
                const imagen = req.file ? req.file.filename : null;
                const nuevaCategoria = await Categoria.create({
                    nombre_categoria,
                    descripcion_categoria,
                    imagen
                });
                res.status(201).json(nuevaCategoria);
            } catch (error) {
                res.status(500).json({ message: "Error al crear la categoría", error });
            }
        });
    },

    // Actualizar una categoría 
    async update(req, res) {
        upload(req, res, async (err) => {
          if (err) {
            return res.status(400).json({ message: err.message });
          }
          try {
            const { id } = req.params;
            const { nombre_categoria, descripcion_categoria } = req.body;
            const categoria = await Categoria.findByPk(id);
      
            if (!categoria) {
              return res.status(404).json({ message: "Categoría no encontrada" });
            }
      
            let nuevaImagen = categoria.imagen;
      
            // Si se ha subido una nueva imagen, reemplazarla
            if (req.file) {
              // Eliminar la imagen anterior si existe
              if (categoria.imagen) {
                const oldImagePath = path.join(uploadDir, categoria.imagen);
                if (fs.existsSync(oldImagePath)) {
                  fs.unlinkSync(oldImagePath);
                }
              }
              nuevaImagen = req.file.filename;
            }
      
            // Actualizar la categoría en la base de datos
            await categoria.update({
              nombre_categoria,
              descripcion_categoria,
              imagen: nuevaImagen, // Se mantiene la imagen anterior si no se subió una nueva
            });
      
            // Devolver la categoría actualizada con la URL completa
            res.status(200).json({
                ...categoria.dataValues,
                imagen: nuevaImagen ? `http://localhost:3000/imagenes/${nuevaImagen}` : categoria.imagen ? `http://localhost:3000/imagenes/${categoria.imagen}` : null,
              });
              
          } catch (error) {
            res.status(500).json({ message: "Error al actualizar la categoría", error });
          }
        });
      },
      
    
    // Eliminar una categoría
    async delete(req, res) {
        try {
            const { id } = req.params;
            const categoria = await Categoria.findByPk(id);

            if (!categoria) {
                return res.status(404).json({ message: "Categoría no encontrada" });
            }

            // Eliminar la imagen si existe
            if (categoria.imagen) {
                const imagePath = path.join(uploadDir, categoria.imagen);
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath);
                }
            }

            await categoria.destroy();
            res.status(200).json({ message: "Categoría eliminada correctamente" });

        } catch (error) {
            res.status(500).json({ message: "Error al eliminar la categoría", error });
        }
    }
};

export default CategoriaController;
