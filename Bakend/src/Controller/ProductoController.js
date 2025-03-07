import Producto from "../model/ProductoModel.js";
import Imagen from "../model/ImagenModel.js";
import fs from "fs";
import path from "path";
import Talla from "../model/TallaModel.js";
import ProductoTalla from "../model/ProductoTallaModel.js";

const ProductoController = {

    // Obtener todos los productos con sus imágenes
    async getAll(req, res) {
        try {
            const productos = await Producto.findAll({
                include: [
                    { model: Talla, as: "tallas", attributes: ["nombre"]},
                    { model: Imagen, as: "imagenes" }
                ]
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
                include: [
                    { model: Talla, as: "tallas", attributes: ["nombre"]},
                    { model: Imagen, as: "imagenes" }
                ]
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
            const { codigo, nombre, precio, descripcion, estado, genero_dirigido, id_categoria, tallas } = req.body;
    
            const nuevoProducto = await Producto.create({
                codigo, nombre, precio, descripcion, estado, genero_dirigido, id_categoria
            });
    
            // Guardar tallas si se enviaron
            if (tallas) {
                const tallasArray = tallas.split(",").map(id => ({
                    id_producto: nuevoProducto.id,
                    id_talla: parseInt(id)
                }));
                await ProductoTalla.bulkCreate(tallasArray);
            }
    
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
            const { codigo, nombre, precio, descripcion, estado, genero_dirigido, id_categoria,tallas } = req.body;
            const producto = await Producto.findByPk(id);

            if (!producto) {
                return res.status(404).json({ message: "Producto no encontrado" });
            }

            await producto.update({ codigo, nombre, precio, descripcion, estado, genero_dirigido, id_categoria });

            if (tallas) {
                const tallasArray = tallas.split(",").map(id => parseInt(id));
            
                // Verificar que las tallas existen
                const tallasValidas = await Talla.findAll({ where: { id: tallasArray } });
            
                if (tallasValidas.length !== tallasArray.length) {
                    return res.status(400).json({ message: "Algunas tallas no existen" });
                }

                await ProductoTalla.destroy({ where: { id_producto: id } });
            
                const nuevasTallas = tallasArray.map(id_talla => ({
                    id_producto: id,
                    id_talla: id_talla
                }));
                
                await ProductoTalla.bulkCreate(nuevasTallas);
            }
            

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
            if (productos.length === 0) {
                return res.status(404).json({ message: "No hay productos masculinos disponibles" });
            }
            res.status(200).json(productos);
        } catch (error) {
            res.status(500).json({ message: "Error al obtener los productos masculinos", error });
        }
    },

    async ProductosFemeninos(req, res) {
        try {
            const productos = await Producto.findAll({
                where: { genero_dirigido: "Femenido" },
                include: [{ model: Imagen, as: "imagenes" }]
            });
            if (productos.length === 0) {
                return res.status(404).json({ message: "No hay productos femeninos disponibles" });
            }
            res.status(200).json(productos);
        } catch (error) {
            res.status(500).json({ message: "Error al obtener los productos femeninos", error });
        }
    }

};

export default ProductoController;
