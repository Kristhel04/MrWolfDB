// src/controllers/CategoriaController.js
import Categoria from '../model/CategoriaModel.js';

const CategoriaController = {
    // Obtener todas las categorías
    async getAll(req, res) {
        try {
            const categorias = await Categoria.findAll();
            res.status(200).json(categorias);
        } catch (error) {
            res.status(500).json({ message: 'Error al obtener las categorías', error });
        }
    },

    // Obtener una categoría por ID
    async getById(req, res) {
        try {
            const { id } = req.params;
            const categoria = await Categoria.findByPk(id);
            if (categoria) {
                res.status(200).json(categoria);
            } else {
                res.status(404).json({ message: 'Categoría no encontrada' });
            }
        } catch (error) {
            res.status(500).json({ message: 'Error al obtener la categoría', error });
        }
    },

    // Crear una nueva categoría
    async create(req, res) {
        try {
            const { nombre_categoria, descripcion_categoria, imagen } = req.body;
            const nuevaCategoria = await Categoria.create({
                 nombre_categoria, 
                 descripcion_categoria,
                  imagen 
                });
            res.status(201).json(nuevaCategoria);
        } catch (error) {
            res.status(500).json({ message: 'Error al crear la categoría', error });
        }
    },

    // Actualizar una categoría
    async update(req, res) {
        try {
            const { id } = req.params;
            const { nombre_categoria, descripcion_categoria, imagen } = req.body;
            const categoria = await Categoria.findByPk(id);
            if (categoria) {
                await categoria.update({ 
                    nombre_categoria, 
                    descripcion_categoria, 
                    imagen 
                });
                res.status(200).json(categoria);
            } else {
                res.status(404).json({ message: 'Categoría no encontrada' });
            }
        } catch (error) {
            res.status(500).json({ message: 'Error al actualizar la categoría', error });
        }
    },

    // Eliminar una categoría
    async delete(req, res) {
        try {
            const { id } = req.params;
            const categoria = await Categoria.findByPk(id);
            if (categoria) {
                await categoria.destroy();
                res.status(200).json({ message: 'Categoría eliminada correctamente' });
            } else {
                res.status(404).json({ message: 'Categoría no encontrada' });
            }
        } catch (error) {
            res.status(500).json({ message: 'Error al eliminar la categoría', error });
        }
    }
};

export default CategoriaController;
