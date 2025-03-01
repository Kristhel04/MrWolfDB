import Producto from "../model/ProductoModel.js";
import Imagen from "../model/ImagenModel.js";
import fs from "fs";
import path from "path";

const ProductoController = {

    // Obtener todos los productos con sus imágenes
    async getAll(req, res) {
        try {
            const productos = await Producto.findAll({
                include: [{ model: Imagen, as: "imagenes" }]
            });
            res.status(200).json(productos);
        } catch (error) {
            res.status(500).json({ message: "Error al obtener los productos", error });
        }
    },

    // Buscar producto por nombre o código
    async busqueda(req, res) {
        try {
            const { nombre, codigo } = req.body;

            if (!nombre && !codigo) {
                return res.status(400).json({ message: "Debes proporcionar un nombre o código" });
            }

            const condiciones = {};
            if (nombre) condiciones.nombre = nombre;
            if (codigo) condiciones.codigo = codigo;

            const productos = await Producto.findAll({
                where: condiciones,
                include: [{ model: Imagen, as: "imagenes" }]
            });

            if (productos.length > 0) {
                res.status(200).json(productos);
            } else {
                res.status(404).json({ message: "No se encontraron productos con esos criterios" });
            }
        } catch (error) {
            res.status(500).json({ message: "Error al buscar productos", error });
        }
    },

    // Crear un nuevo producto con imágenes
    async create(req, res) {
        try {
            const { codigo, nombre, precio, descripcion, talla, estado, genero_dirigido, id_categoria } = req.body;
            const nuevoProducto = await Producto.create({
                codigo, nombre, precio, descripcion, talla, estado, genero_dirigido, id_categoria
            });

            // Guardar imágenes si existen
            if (req.files && req.files.length > 0) {
                const imagenesData = req.files.map(file => ({
                    id_producto: nuevoProducto.id,
                    nomImagen: file.filename
                }));
                await Imagen.bulkCreate(imagenesData);
            }

            res.status(201).json({ message: "Producto agregado correctamente", producto: nuevoProducto });
        } catch (error) {
            res.status(500).json({ message: "Error al agregar el producto", error });
        }
    },

    // Actualizar un producto y reemplazar sus imágenes
    async update(req, res) {
        try {
            const { id } = req.params;
            const { codigo, nombre, precio, descripcion, talla, estado, genero_dirigido, id_categoria } = req.body;
            const producto = await Producto.findByPk(id);

            if (!producto) {
                return res.status(404).json({ message: "Producto no encontrado" });
            }

            await producto.update({ codigo, nombre, precio, descripcion, talla, estado, genero_dirigido, id_categoria });

            // Si se enviaron nuevas imágenes, eliminar las anteriores y agregar las nuevas
            if (req.files && req.files.length > 0) {
                const imagenesViejas = await Imagen.findAll({ where: { id_producto: id } });

                // Eliminar archivos de imágenes anteriores
                imagenesViejas.forEach(img => {
                    const filePath = path.join("public/ImgProductos", img.nomImagen);
                    if (fs.existsSync(filePath)) {
                        fs.unlinkSync(filePath);
                    }
                })
                // Guardar nuevas imágenes
                const imgNuevas = req.files.map(file => ({
                    id_producto: id,
                    nomImagen: file.filename
                }));
                await Imagen.destroy({ where: { id_producto: id } });
                await Imagen.bulkCreate(imgNuevas);
            }

            res.status(200).json({ message: "Producto actualizado correctamente" });
        } catch (error) {
            res.status(500).json({ message: "Error al actualizar el producto", error });
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
            imagenes.forEach(img => {
                const filePath = path.join("public/ImgProductos", img.nomImagen);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            });

            await Imagen.destroy({ where: { id_producto: id } });
            await producto.destroy();

            res.status(200).json({ message: "Producto eliminado correctamente" });
        } catch (error) {
            res.status(500).json({ message: "Error al eliminar el producto", error });
        }
    },

    async ProductosMasculinos(req, res) {
        try {
            const productos = await Producto.findAll({
                where: { genero_dirigido: "Masculino" },
                include: [{ model: Imagen, as: "imagenes" }]
            });
            res.status(200).json(productos);
        } catch (error) {
            res.status(500).json({ message: "Error al obtener los productos masculinos", error });
        }
    },

    async ProductosMasculinos(req, res) {
        try {
            const productos = await Producto.findAll({
                where: { genero_dirigido: "Femenido" },
                include: [{ model: Imagen, as: "imagenes" }]
            });
            res.status(200).json(productos);
        } catch (error) {
            res.status(500).json({ message: "Error al obtener los productos masculinos", error });
        }
    }

};

export default ProductoController;
