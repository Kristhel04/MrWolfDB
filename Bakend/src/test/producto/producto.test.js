import request from 'supertest';
import app from '../../app';  // Asegúrate de que este sea el archivo correcto
import { Producto, ProductoTalla, Imagen } from '../../model';  // Importa tus modelos

describe('POST /api/v1/productos', () => {

  let newProduct;

  beforeAll(() => {
    newProduct = {
      codigo: '12345',
      nombre: 'Zapato Deportivo',
      precio: 99.99,
      descripcion: 'Un zapato deportivo cómodo y duradero.',
      estado: 'activo',
      genero_dirigido: 'masculino',
      id_categoria: 1,
      tallas: '1,2,3', // Tallas separadas por coma
    };
  });

  test('Debe registrar un producto correctamente con tallas e imágenes', async () => {
    // Simulamos la subida de archivos (imágenes) usando Supertest
    const response = await request(app)
      .post('/api/v1/productos')
      .field('codigo', newProduct.codigo)
      .field('nombre', newProduct.nombre)
      .field('precio', newProduct.precio)
      .field('descripcion', newProduct.descripcion)
      .field('estado', newProduct.estado)
      .field('genero_dirigido', newProduct.genero_dirigido)
      .field('id_categoria', newProduct.id_categoria)
      .field('tallas', newProduct.tallas)
      .attach('imagenes', 'tests/fixtures/fake-image.jpg')  // Ruta a una imagen de prueba
      .expect(201);  // Esperamos un código 201 (Creado)

    // Verificar que la respuesta tenga el mensaje correcto
    expect(response.body.message).toBe('Producto agregado correctamente');

    // Verificar que el producto fue agregado
    const producto = await Producto.findOne({ where: { codigo: newProduct.codigo } });
    expect(producto).toBeTruthy();
    expect(producto.nombre).toBe(newProduct.nombre);
    expect(producto.precio).toBe(newProduct.precio);

    // Verificar que las tallas fueron insertadas
    const tallas = await ProductoTalla.findAll({ where: { id_producto: producto.id } });
    expect(tallas.length).toBe(3);  // Verificar que tres tallas fueron asociadas

    // Verificar que las imágenes fueron insertadas
    const imagenes = await Imagen.findAll({ where: { id_producto: producto.id } });
    expect(imagenes.length).toBe(1);  // Verificar que una imagen fue asociada
    expect(imagenes[0].nomImagen).toBe('fake-image.jpg');
  });

});
