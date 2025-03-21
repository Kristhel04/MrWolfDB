import request from "supertest";
import { expect } from "chai";
import app from "../../src/app.js"; // Asegúrate de exportar tu app Express
import Producto from "../model/ProductoModel.js";
import ProductoTalla from "../model/ProductoTallaModel.js";

describe("ProductoController", () => {

  //Probar pruebas: npx mocha "src/test/**/*.test.js"
  before(async () => {
    // Inserta un producto de prueba en la base de datos
    await Producto.create({
      id: "10",
      codigo: "12",
      nombre: "Producto de prueba",
      precio: 100,
      descripcion: "Descripción de prueba",
      estado: "Activo",
      genero_dirigido: "Masculino",
      id_categoria: 1,
    });
  });

  // Limpiar la base de datos después de ejecutar la prueba
  after(async () => {
    // Eliminar el producto de prueba después de las pruebas
    // Eliminar las asociaciones en Producto_Tallas antes de eliminar el producto
    await ProductoTalla.destroy({ where: { id_producto: 10 } });
    await Producto.destroy({ where: { id: 10 } });
  });

  describe("GET /productos", () => {
    it("debería devolver una lista de productos", async () => {
      const response = await request(app).get("/api/v1/productos");
      expect(response.status).to.equal(200);
      expect(response.body).to.be.an("array");
    });
  });

  describe("POST /productos", () => {
    it("debería crear un nuevo producto", async () => {
      const nuevoProducto = {
        id: "10", //cambio para que busque el producto id 10 
        codigo: "12",
        nombre: "Producto de prueba",
        precio: 100,
        descripcion: "Descripción de prueba",
        estado: "Activo",
        genero_dirigido: "Masculino",
        id_categoria: 1,
        tallas: "1,2,3",
      };

      const response = await request(app)
        .post("/api/v1/productos")
        .send(nuevoProducto);

      expect(response.status).to.equal(201);
      expect(response.body).to.have.property(
        "message",
        "Producto agregado correctamente"
      );
      expect(response.body.producto).to.have.property("id");
    });
  });

  describe("PUT /productos/:id", () => {
    it("debería actualizar un producto existente", async () => {
        const productoId = 10; // Cambia esto por un ID válido
        const datosActualizados = {
            nombre: "Producto Actualizado",
            precio: 150,
        };

        const response = await request(app)
            .put(`/api/v1/productos/${productoId}`)
            .send(datosActualizados);

        expect(response.status).to.equal(200);
        expect(response.body).to.have.property(
            "message",
            "Producto actualizado correctamente"
        );
        expect(response.body.producto.nombre).to.equal("Producto Actualizado");
        expect(response.body.producto.precio).to.equal(150);
    });

    it("debería devolver un error 404 si el producto no existe", async () => {
        const productoId = 9999; // ID que no existe
        const datosActualizados = {
            nombre: "Producto Actualizado",
            precio: 150,
        };

        const response = await request(app)
            .put(`/api/v1/productos/${productoId}`)
            .send(datosActualizados);

        expect(response.status).to.equal(404);
        expect(response.body).to.have.property("message", "Producto no encontrado");
    });

    it("debería actualizar las tallas asociadas al producto", async () => {
        const productoId = 10; // Cambia esto por un ID válido
        const datosActualizados = {
            nombre: "Producto Actualizado",
            precio: 150,
            tallas: "1,2", // IDs de tallas válidas
        };

        const response = await request(app)
            .put(`/api/v1/productos/${productoId}`)
            .send(datosActualizados);

        expect(response.status).to.equal(200);
        expect(response.body.producto.tallas).to.be.an("array").that.is.not.empty;
    });

    it("debería devolver un error 400 si las tallas no existen", async () => {
        const productoId = 10; // Cambia esto por un ID válido
        const datosActualizados = {
            nombre: "Producto Actualizado",
            precio: 150,
            tallas: "999,1000", // IDs de tallas que no existen
        };

        const response = await request(app)
            .put(`/api/v1/productos/${productoId}`)
            .send(datosActualizados);

        expect(response.status).to.equal(400);
        expect(response.body).to.have.property("message", "Algunas tallas no existen");
    });
});


/**   describe('GET /productos/:id', () => {
    it('debería devolver un producto específico', async () => {
      const productoId = 10; // Cambia esto por un ID válido
      const response = await request(app).get(`/api/v1/productos/${productoId}`);
      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('id', productoId);
    });
  });*/

  
  
  
  describe('DELETE /productos/:id', () => {
    it('debería eliminar un producto existente', async () => {
      const productoId = 10; // Cambia esto por un ID válido
      const response = await request(app).delete(`/api/v1/productos/${productoId}`);
      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('message', 'Producto eliminado correctamente');
    });
  });
});


