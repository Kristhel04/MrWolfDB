import ProductoController from '../controllers/ProductoController.js';
import Producto from '../model/ProductoModel.js';
import Imagen from '../model/ImagenModel.js';
import Talla from '../model/TallaModel.js';
import ProductoTalla from '../model/ProductoTallaModel.js';
import fs from 'fs';
import path from 'path';

// Mock de los modelos y dependencias
jest.mock('../model/ProductoModel.js');
jest.mock('../model/ImagenModel.js');
jest.mock('../model/TallaModel.js');
jest.mock('../model/ProductoTallaModel.js');
jest.mock('fs');
jest.mock('path');

describe('ProductoController', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      files: [],
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // pruebas

  describe('getAll', () => {
    it('debería obtener todos los productos con imágenes y tallas', async () => {
      const mockProductos = [
        { id: 1, nombre: 'Producto 1', tallas: [], imagenes: [] },
        { id: 2, nombre: 'Producto 2', tallas: [], imagenes: [] },
      ];
  
      Producto.findAll.mockResolvedValue(mockProductos);
  
      await ProductoController.getAll(req, res);
  
      expect(Producto.findAll).toHaveBeenCalledWith({
        include: [
          { model: Talla, as: 'tallas' },
          { model: Imagen, as: 'imagenes' },
        ],
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockProductos);
    });
  
    it('debería manejar errores al obtener los productos', async () => {
      const mockError = new Error('Error de base de datos');
      Producto.findAll.mockRejectedValue(mockError);
  
      await ProductoController.getAll(req, res);
  
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Error al obtener los productos',
        error: mockError,
      });
    });
  });

  describe('create', () => {
    it('debería crear un nuevo producto con imágenes y tallas', async () => {
      req.body = {
        codigo: '123',
        nombre: 'Producto Nuevo',
        precio: '100',
        descripcion: 'Descripción',
        estado: 'Activo',
        genero_dirigido: 'Masculino',
        id_categoria: 1,
        tallas: '1,2,3',
      };
      req.files = [
        { filename: 'imagen1.jpg' },
        { filename: 'imagen2.jpg' },
      ];
  
      const mockProducto = { id: 1, ...req.body };
      Producto.create.mockResolvedValue(mockProducto);
      ProductoTalla.bulkCreate.mockResolvedValue([]);
      Imagen.bulkCreate.mockResolvedValue([]);
  
      await ProductoController.create(req, res);
  
      expect(Producto.create).toHaveBeenCalledWith({
        codigo: 123,
        nombre: 'Producto Nuevo',
        precio: 100,
        descripcion: 'Descripción',
        estado: 'Activo',
        genero_dirigido: 'Masculino',
        id_categoria: 1,
      });
      expect(ProductoTalla.bulkCreate).toHaveBeenCalledWith([
        { id_producto: 1, id_talla: 1 },
        { id_producto: 1, id_talla: 2 },
        { id_producto: 1, id_talla: 3 },
      ]);
      expect(Imagen.bulkCreate).toHaveBeenCalledWith([
        { id_producto: 1, nomImagen: 'imagen1.jpg' },
        { id_producto: 1, nomImagen: 'imagen2.jpg' },
      ]);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Producto agregado correctamente',
        producto: mockProducto,
      });
    });
  
    it('debería manejar errores al crear un producto', async () => {
      const mockError = new Error('Error de base de datos');
      Producto.create.mockRejectedValue(mockError);
  
      await ProductoController.create(req, res);
  
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Error al agregar el producto',
        error: mockError,
      });
    });
  });

  describe('busqueda', () => {
    it('debería buscar productos por nombre o código', async () => {
      req.body = { nombre: 'Producto 1' };
  
      const mockProductos = [
        { id: 1, nombre: 'Producto 1', tallas: [], imagenes: [] },
      ];
  
      Producto.findAll.mockResolvedValue(mockProductos);
  
      await ProductoController.busqueda(req, res);
  
      expect(Producto.findAll).toHaveBeenCalledWith({
        where: { nombre: 'Producto 1' },
        include: [
          { model: Talla, as: 'tallas', attributes: ['nombre'] },
          { model: Imagen, as: 'imagenes' },
        ],
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockProductos);
    });
  
    it('debería manejar errores al buscar productos', async () => {
      const mockError = new Error('Error de base de datos');
      Producto.findAll.mockRejectedValue(mockError);
  
      await ProductoController.busqueda(req, res);
  
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Error al buscar productos',
        error: mockError,
      });
    });
  });

  describe('update', () => {
    it('debería actualizar un producto y sus imágenes', async () => {
      req.params = { id: 1 };
      req.body = {
        codigo: '123',
        nombre: 'Producto Actualizado',
        precio: '150',
        descripcion: 'Descripción Actualizada',
        estado: 'Inactivo',
        genero_dirigido: 'Femenino',
        id_categoria: 2,
        tallas: '4,5',
      };
      req.files = [
        { filename: 'nuevaImagen1.jpg' },
        { filename: 'nuevaImagen2.jpg' },
      ];
  
      const mockProducto = { id: 1, ...req.body, update: jest.fn().mockResolvedValue(true) };
      Producto.findByPk.mockResolvedValue(mockProducto);
      Talla.findAll.mockResolvedValue([{ id: 4 }, { id: 5 }]);
      ProductoTalla.destroy.mockResolvedValue(true);
      ProductoTalla.bulkCreate.mockResolvedValue(true);
      Imagen.findAll.mockResolvedValue([{ nomImagen: 'imagenVieja.jpg' }]);
      Imagen.destroy.mockResolvedValue(true);
      Imagen.bulkCreate.mockResolvedValue(true);
      fs.existsSync.mockReturnValue(true);
      fs.unlinkSync.mockReturnValue(true);
  
      await ProductoController.update(req, res);
  
      expect(Producto.findByPk).toHaveBeenCalledWith(1);
      expect(mockProducto.update).toHaveBeenCalledWith({
        codigo: '123',
        nombre: 'Producto Actualizado',
        precio: '150',
        descripcion: 'Descripción Actualizada',
        estado: 'Inactivo',
        genero_dirigido: 'Femenino',
        id_categoria: 2,
      });
      expect(ProductoTalla.destroy).toHaveBeenCalledWith({ where: { id_producto: 1 } });
      expect(ProductoTalla.bulkCreate).toHaveBeenCalledWith([
        { id_producto: 1, id_talla: 4 },
        { id_producto: 1, id_talla: 5 },
      ]);
      expect(Imagen.destroy).toHaveBeenCalledWith({ where: { id_producto: 1 } });
      expect(Imagen.bulkCreate).toHaveBeenCalledWith([
        { id_producto: 1, nomImagen: 'nuevaImagen1.jpg' },
        { id_producto: 1, nomImagen: 'nuevaImagen2.jpg' },
      ]);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Producto actualizado correctamente' });
    });
  
    it('debería manejar errores al actualizar un producto', async () => {
      const mockError = new Error('Error de base de datos');
      Producto.findByPk.mockRejectedValue(mockError);
  
      await ProductoController.update(req, res);
  
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Error al actualizar el producto',
        error: mockError,
      });
    });
  });


  describe('delete', () => {
    it('debería eliminar un producto y sus imágenes', async () => {
      req.params = { id: 1 };
  
      const mockProducto = { id: 1, destroy: jest.fn().mockResolvedValue(true) };
      Producto.findByPk.mockResolvedValue(mockProducto);
      Imagen.findAll.mockResolvedValue([{ nomImagen: 'imagen1.jpg' }]);
      fs.existsSync.mockReturnValue(true);
      fs.unlinkSync.mockReturnValue(true);
      ProductoTalla.destroy.mockResolvedValue(true);
      Imagen.destroy.mockResolvedValue(true);
  
      await ProductoController.delete(req, res);
  
      expect(Producto.findByPk).toHaveBeenCalledWith(1);
      expect(Imagen.findAll).toHaveBeenCalledWith({ where: { id_producto: 1 } });
      expect(fs.unlinkSync).toHaveBeenCalledWith(path.join('public/ImgProductos', 'imagen1.jpg'));
      expect(ProductoTalla.destroy).toHaveBeenCalledWith({ where: { id_producto: 1 } });
      expect(Imagen.destroy).toHaveBeenCalledWith({ where: { id_producto: 1 } });
      expect(mockProducto.destroy).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Producto eliminado correctamente' });
    });
  
    it('debería manejar errores al eliminar un producto', async () => {
      const mockError = new Error('Error de base de datos');
      Producto.findByPk.mockRejectedValue(mockError);
  
      await ProductoController.delete(req, res);
  
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Error al eliminar el producto',
        error: mockError,
      });
    });
  });
});