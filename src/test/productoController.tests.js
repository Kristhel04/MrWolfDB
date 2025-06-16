import request from 'supertest';
import { expect } from 'chai';
import { Sequelize } from 'sequelize';
import app from '../../src/app.js';
import Producto from '../model/ProductoModel.js';
import Categoria from '../model/CategoriaModel.js';
import Talla from '../model/TallaModel.js';
import ProductoTalla from '../model/ProductoTallaModel.js';
import Imagen from '../model/ImagenModel.js';
import ConfRelaciones from '../model/Relaciones.js';

// Configuración de SQLite en memoria para pruebas
const testSequelize = new Sequelize({
  dialect: 'sqlite',
  storage: ':memory:',
  logging: false, // Cambiar a console.log para depuración
  define: {
    freezeTableName: true,
    timestamps: false
  }
});

describe('ProductoController', () => {
  before(async () => {
    try {
      // 1. Inicializar todos los modelos con la conexión de prueba
      Categoria.init(testSequelize);
      Talla.init(testSequelize);
      Producto.init(testSequelize);
      ProductoTalla.init(testSequelize);
      Imagen.init(testSequelize);
      
      // 2. Configurar relaciones (similar a Relaciones.js pero con testSequelize)
      Categoria.hasMany(Producto, { 
        foreignKey: 'id_categoria', 
        as: 'productos' 
      });
      Producto.belongsTo(Categoria, { 
        foreignKey: 'id_categoria',
        as: 'categoria'
      });
      
      Producto.hasMany(Imagen, { 
        foreignKey: 'id_producto',
        as: 'imagenes'
      });
      Imagen.belongsTo(Producto, { 
        foreignKey: 'id_producto',
        as: 'producto'
      });
      
      Producto.belongsToMany(Talla, { 
        through: ProductoTalla,
        foreignKey: 'id_producto',
        as: 'tallas'
      });
      Talla.belongsToMany(Producto, { 
        through: ProductoTalla,
        foreignKey: 'id_talla',
        as: 'product'
      });
      
      // 3. Sincronizar modelos
      await testSequelize.sync({ force: true });
      console.log("Modelos sincronizados correctamente");
      
      // 4. Crear datos de prueba esenciales
      await Categoria.create({
        num_categoria: 1,
        nombre_categoria: 'Ropa',
        descripcion_categoria: 'Categoría de prueba'
      });
      
      await Talla.bulkCreate([
        { id: 1, nombre: 'S' },
        { id: 2, nombre: 'M' },
        { id: 3, nombre: 'L' }
      ]);
      
      // 5. Crear un producto de prueba con relaciones
      await Producto.create({
        id: 1,
        codigo: 'TEST-001',
        nombre: 'Camiseta Básica',
        precio: 29.99,
        descripcion: 'Descripción de prueba',
        estado: 'Activo',
        genero_dirigido: 'Masculino',
        id_categoria: 1 // Corresponde a num_categoria: 1
      });
      
      await ProductoTalla.bulkCreate([
        { id_producto: 1, id_talla: 1 },
        { id_producto: 1, id_talla: 2 }
      ]);
      
      await Imagen.create({
        id_producto: 1,
        nomImagen: 'test-image.jpg'
      });
      
    } catch (error) {
      console.error('Error en before hook:', error);
      throw error;
    }
  });

  after(async () => {
    await testSequelize.close();
  });

  describe('GET /productos', () => {
    it('debería devolver todos los productos con sus relaciones', async () => {
      const response = await request(app).get('/api/v1/productos');
      
      expect(response.status).to.equal(200);
      expect(response.body).to.be.an('array');
      expect(response.body[0]).to.include({
        id: 1,
        nombre: 'Camiseta Básica'
      });
      expect(response.body[0].tallas).to.be.an('array').with.lengthOf(2);
      expect(response.body[0].imagenes).to.be.an('array').with.lengthOf(1);
    });
  });

  describe('POST /productos', () => {
    it('debería crear un nuevo producto con tallas', async () => {
      const nuevoProducto = {
        codigo: 'TEST-002',
        nombre: 'Pantalón Vaquero',
        precio: 59.99,
        descripcion: 'Pantalón de prueba',
        estado: 'Activo',
        genero_dirigido: 'Femenino',
        id_categoria: 1,
        tallas: '1,3' // S y L
      };

      const response = await request(app)
        .post('/api/v1/productos')
        .send(nuevoProducto);

      expect(response.status).to.equal(201);
      expect(response.body).to.have.property('message', 'Producto agregado correctamente');
      
      // Verificar que se crearon las relaciones
      const productoId = response.body.producto.id;
      const relaciones = await ProductoTalla.findAll({
        where: { id_producto: productoId }
      });
      expect(relaciones.length).to.equal(2);
    });
  });

  describe('PUT /productos/:id', () => {
    it('debería actualizar un producto existente', async () => {
      const updates = {
        nombre: 'Camiseta Actualizada',
        precio: 39.99,
        tallas: '2,3' // M y L
      };

      const response = await request(app)
        .put('/api/v1/productos/1')
        .send(updates);

      expect(response.status).to.equal(200);
      expect(response.body.message).to.equal('Producto actualizado correctamente');
      expect(response.body.producto.nombre).to.equal(updates.nombre);
      
      // Verificar tallas actualizadas
      const relaciones = await ProductoTalla.findAll({
        where: { id_producto: 1 }
      });
      expect(relaciones.length).to.equal(2);
    });
  });

  describe('DELETE /productos/:id', () => {
    it('debería eliminar un producto y sus relaciones', async () => {
      // Primero crear un producto para eliminar
      const producto = await Producto.create({
        codigo: 'TEST-DELETE',
        nombre: 'Producto a Eliminar',
        precio: 19.99,
        descripcion: 'Este será eliminado',
        estado: 'Activo',
        genero_dirigido: 'Masculino',
        id_categoria: 1
      });

      await ProductoTalla.bulkCreate([
        { id_producto: producto.id, id_talla: 1 },
        { id_producto: producto.id, id_talla: 2 }
      ]);

      const response = await request(app)
        .delete(`/api/v1/productos/${producto.id}`);

      expect(response.status).to.equal(200);
      expect(response.body.message).to.equal('Producto eliminado correctamente');
      
      // Verificar que se eliminó el producto y sus relaciones
      const productoEliminado = await Producto.findByPk(producto.id);
      expect(productoEliminado).to.be.null;
      
      const relaciones = await ProductoTalla.findAll({
        where: { id_producto: producto.id }
      });
      expect(relaciones.length).to.equal(0);
    });
  });
});