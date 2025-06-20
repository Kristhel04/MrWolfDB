import Producto from "../model/ProductoModel.js";
import Imagen from "../model/ImagenModel.js";
import fs from "fs";
import path from "path";
import Talla from "../model/TallaModel.js";
import ProductoTalla from "../model/ProductoTallaModel.js";
import { Sequelize } from "sequelize";

const ProductoController = {
  // Obtener todos los productos con sus imágenes
  async getAll(req, res) {
    try {
      const productos = await Producto.findAll({
        include: [
          { model: Talla, as: "tallas" },
          { model: Imagen, as: "imagenes" },
        ],
      });
      res.status(200).json(productos);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error al obtener los productos", error });
    }
  },
  async getById(req, res) {
    try {
        const { id } = req.params;
        const producto = await Producto.findByPk(id, {
            include: [
                { model: Talla, as: "tallas", attributes: ["id", "nombre"] }, // Mantener id y nombre
                { model: Imagen, as: "imagenes" }
            ],
        });

        if (!producto) {
            return res.status(404).json({ message: "Producto no encontrado" });
        }

        res.status(200).json(producto); // Enviar producto directamente sin modificar tallas
    } catch (error) {
        res.status(500).json({ message: "Error al obtener el producto", error });
    }
},

 // Crear un nuevo producto con imágenes
async create(req, res) {
  try {
    console.log("Datos recibidos:", req.body); // Verificar los datos recibidos
    console.log("Archivos recibidos:", req.files); // Verificar las imágenes

    const {
      codigo,
      nombre,
      precio,
      descripcion,
      estado,
      genero_dirigido,
      id_categoria,
      tallas,
    } = req.body;

    const precioNum = parseFloat(precio);
    const codigoNum = parseInt(codigo);

    // Crear el nuevo producto
    const nuevoProducto = await Producto.create({
      codigo,
      nombre,
      precio,
      descripcion,
      estado,
      genero_dirigido,
      id_categoria,
    });

    // Procesar las tallas y asociarlas al producto
    if (tallas) {
      const tallasArray = tallas.split(",").map((id) => ({
        id_producto: nuevoProducto.id,
        id_talla: parseInt(id.trim()),
      }));

      console.log("Tallas procesadas:", tallasArray);

      await ProductoTalla.bulkCreate(tallasArray);
      console.log("Tallas insertadas en ProductoTalla");
    }

    // Guardar imágenes si existen, si no, usar imagen genérica
    let imagenesData = [];

    if (req.files && req.files.length > 0) {
      imagenesData = req.files.map((file) => ({
        id_producto: nuevoProducto.id,
        nomImagen: file.filename,
      }));
      console.log("Archivos procesados:", imagenesData);
    } else {
      // Si no se subieron imágenes, agregar imagen genérica
      imagenesData.push({
        id_producto: nuevoProducto.id,
        nomImagen: "OPI.jpeg", 
      });
      console.log("No se subieron imágenes, se usará la imagen genérica OPI.jpeg");
    }

    await Imagen.bulkCreate(imagenesData);
    console.log("Imágenes insertadas en Imagen");

    res.status(201).json({
      message: "Producto agregado correctamente",
      producto: nuevoProducto,
    });
  } catch (error) {
    console.error("Error al agregar producto:", error);
    res.status(500).json({ message: "Error al agregar el producto", error });
  }
},

  // Obtener productos masculinos
  async ProductosMasculinos(req, res) {
    try {
      const productos = await Producto.findAll({
        where: { genero_dirigido: "Masculino" },
        include: [{ model: Imagen, as: "imagenes" }],
      });
      if (productos.length === 0) {
        return res
          .status(404)
          .json({ message: "No hay productos masculinos disponibles" });
      }
      res.status(200).json(productos);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error al obtener los productos masculinos", error });
    }
  },

  // Obtener productos femeninos
  async ProductosFemeninos(req, res) {
    try {
      const productos = await Producto.findAll({
        where: { genero_dirigido: "Femenino" }, 
        include: [{ model: Imagen, as: "imagenes" }],
      });
      if (productos.length === 0) {
        return res
          .status(404)
          .json({ message: "No hay productos femeninos disponibles" });
      }
      res.status(200).json(productos);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error al obtener los productos femeninos", error });
    }
  },

  // Buscar producto por nombre o código
  async busqueda(req, res) {
    try {
      const { nombre, codigo } = req.body;

      if (!nombre && !codigo) {
        return res
          .status(400)
          .json({ message: "Debes proporcionar un nombre o código" });
      }

      const condiciones = {};
      if (nombre) condiciones.nombre = nombre;
      if (codigo) condiciones.codigo = codigo;

      const productos = await Producto.findAll({
        where: condiciones,
        include: [
          { model: Talla, as: "tallas", attributes: ["nombre"] },
          { model: Imagen, as: "imagenes" },
        ],
      });

      if (productos.length > 0) {
        res.status(200).json(productos);
      } else {
        res
          .status(404)
          .json({ message: "No se encontraron productos con esos criterios" });
      }
    } catch (error) {
      res.status(500).json({ message: "Error al buscar productos", error });
    }
  },

  // Actualizar un producto y reemplazar sus imágenes
  async update(req, res) {
    try {
      const { id } = req.params;
      const {
        codigo,
        nombre,
        precio,
        descripcion,
        estado,
        genero_dirigido,
        id_categoria,
        tallas,
      } = req.body;

      // Buscar el producto por su ID
      const producto = await Producto.findByPk(id, {
        include: [
          { model: Talla, as: "tallas" }, // Incluir las tallas asociadas
          { model: Imagen, as: "imagenes" }, // Incluir las imágenes asociadas
        ],
      });

      if (!producto) {
        return res.status(404).json({ message: "Producto no encontrado" });
      }

      // Actualizar los campos del producto
      await producto.update({
        codigo,
        nombre,
        precio,
        descripcion,
        estado,
        genero_dirigido,
        id_categoria,
      });

      // Actualizar las tallas asociadas al producto
      if (tallas) {
        const tallasArray = tallas.split(",").map((id) => parseInt(id));

        // Verificar que las tallas existen
        const tallasValidas = await Talla.findAll({
          where: { id: tallasArray },
        });

        if (tallasValidas.length !== tallasArray.length) {
          return res.status(400).json({ message: "Algunas tallas no existen" });
        }

        // Eliminar las relaciones anteriores de tallas
        await ProductoTalla.destroy({ where: { id_producto: id } });

        // Crear las nuevas relaciones de tallas
        const nuevasTallas = tallasArray.map((id_talla) => ({
          id_producto: id,
          id_talla: id_talla,
        }));
        await ProductoTalla.bulkCreate(nuevasTallas);
      }

      // Actualizar las imágenes asociadas al producto
      if (req.files && req.files.length > 0) {
        const imagenesViejas = await Imagen.findAll({
          where: { id_producto: id },
        });

        // Eliminar archivos de imágenes anteriores
        imagenesViejas.forEach((img) => {
          const filePath = path.join("public/ImgProductos", img.nomImagen);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        });

        // Guardar nuevas imágenes
        const imgNuevas = req.files.map((file) => ({
          id_producto: id,
          nomImagen: file.filename,
        }));
        await Imagen.destroy({ where: { id_producto: id } });
        await Imagen.bulkCreate(imgNuevas);
      }

      // Obtener el producto actualizado con sus relaciones
      const productoActualizado = await Producto.findByPk(id, {
        include: [
          { model: Talla, as: "tallas" }, // Incluir las tallas asociadas
          { model: Imagen, as: "imagenes" }, // Incluir las imágenes asociadas
        ],
      });

      // Devolver el producto actualizado en la respuesta
      res.status(200).json({
        message: "Producto actualizado correctamente",
        producto: productoActualizado, // El producto actualizado está dentro de un objeto "producto"
      });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error al actualizar el producto", error });
    }
  },

  // Eliminar un producto junto con sus imágenes
  async delete(req, res) {
    try {
      const { id } = req.params;
      const producto = await Producto.findByPk(id);

      if (!producto) {
        return res.status(404).json({ message: "Producto no encontrado" });
      }

      // Eliminar imágenes antes de borrar el producto
      const imagenes = await Imagen.findAll({ where: { id_producto: id } });
      imagenes.forEach((img) => {
        const filePath = path.join("public/ImgProductos", img.nomImagen);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });

      await ProductoTalla.destroy({ where: { id_producto: id } });
      await Imagen.destroy({ where: { id_producto: id } });
      await producto.destroy();

      res.status(200).json({ message: "Producto eliminado correctamente" });
    } catch (error) {
      res.status(500).json({ message: "Error al eliminar el producto", error });
    }
  },

  async producAleatorios(req, res) {
    try {
      const productos = await Producto.findAll({
        include: [{ model: Imagen, as: "imagenes" }],
        order: Sequelize.literal("NEWID()"),
        limit: 20,
      });

      res.status(200).json(productos);
    } catch (error) {
      console.error("Error al obtener productos aleatorios:", error);
      res.status(500).json({
        message: "Error al obtener productos aleatorios",
        error: error.message,
      });
    }
  },

  async getProductosPorCategoria(req, res) {
    try {
        const { id } = req.params;
        const productos = await Producto.findAll({
            where: { id_categoria: id },
            include: [
                {
                    model: Imagen,
                    as: "imagenes",
                    attributes: ["nomImagen"]
                }
            ]
        });
        res.status(200).json(productos);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener productos", error });
    }
   }
   
};

export default ProductoController;
