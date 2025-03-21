import request from "supertest";
import { expect } from "chai";
import app from "../../src/app.js"; // Asegúrate de exportar tu app Express
import Usuario from "../model/UsuarioModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

describe("UsuarioController", () => {
  let testUser; // Variable para almacenar el usuario de prueba
  let authToken; // Variable para almacenar el token JWT

  // Antes de las pruebas: Crear un usuario de prueba y generar un token JWT
  // Antes de las pruebas: Crear un usuario de prueba y generar un token JWT
  before(async () => {
    try {
      const salt = await bcrypt.genSalt(10);
      const contraseñaEncriptada = await bcrypt.hash("password123", salt);

      testUser = await Usuario.create({
        cedula: "123456789",
        nombre_usuario: "testuser",
        nombre_completo: "Test User",
        email: "test1@example.com", // Asegúrate de que este correo coincida con el de las pruebas
        contrasena: contraseñaEncriptada,
        telefono: "1234567890",
        direccion_envio: "Calle Falsa 123",
        email_facturacion: "test@example.com",
        imagen: "default.jpg",
        rol: "Administrador",
      });

      // Generar un token JWT para el usuario de prueba
      authToken = jwt.sign(
        {
          cedula: testUser.cedula,
          rol: testUser.rol,
        },
        process.env.JWT_SECRET, // Asegúrate de que esta variable esté configurada
        { expiresIn: "1h" }
      );
    } catch (error) {
      console.error("Error en el hook before:", error);
      throw error; // Relanza el error para que Mocha lo capture
    }
  });

  // Después de las pruebas: Eliminar el usuario de prueba
  after(async () => {
    if (testUser && testUser.cedula) {
      await Usuario.destroy({ where: { cedula: testUser.cedula } });
    }
  });

  // Pruebas para GET /usuarios
  describe("GET /usuarios", () => {
    it("debería devolver una lista de usuarios", async () => {
      const response = await request(app).get("/api/v1/usuarios");
      expect(response.status).to.equal(200);
      expect(response.body).to.be.an("array");
    });
  });

  // Pruebas para POST /usuarios
  describe("POST /usuarios", () => {
    it("debería crear un nuevo usuario", async () => {
      const nuevoUsuario = {
        cedula: "987654321",
        nombre_usuario: "newuser",
        nombre_completo: "New User",
        email: "newuser@example.com",
        contrasena: "password123",
        telefono: "0987654321",
        direccion_envio: "Calle Nueva 456",
        email_facturacion: "newuser@example.com",
        imagen: "new.jpg",
        rol: "Administrador",
      };

      const response = await request(app)
        .post("/api/v1/usuarios")
        .send(nuevoUsuario);

      expect(response.status).to.equal(200);
      expect(response.body).to.have.property("message", "Usuario creado");
      expect(response.body.nuevoUsuario).to.have.property(
        "cedula",
        "987654321"
      );

      // Limpiar el usuario creado
      await Usuario.destroy({ where: { cedula: "987654321" } });
    });

    it("debería devolver un error si faltan campos obligatorios", async () => {
      const usuarioIncompleto = {
        cedula: "123123123",
        nombre_usuario: "incomplete",
      };

      const response = await request(app)
        .post("/api/v1/usuarios")
        .send(usuarioIncompleto);

      expect(response.status).to.equal(500);
      expect(response.body).to.have.property(
        "message",
        "Error al crear el usuario"
      );
    });
  });

  // Pruebas para GET /usuarios/:cedula
  describe("GET /usuarios/:cedula", () => {
    it("debería devolver un usuario específico", async () => {
      const response = await request(app)
        .get(`/api/v1/usuarios/${testUser.cedula}`)
        .set("Authorization", `Bearer ${authToken}`); // Incluir el token JWT

      expect(response.status).to.equal(200);
      expect(response.body).to.have.property("cedula", testUser.cedula);
    });

    it("debería devolver un error 404 si el usuario no existe", async () => {
      const cedulaInexistente = "000000000";
      const response = await request(app)
        .get(`/api/v1/usuarios/${cedulaInexistente}`)
        .set("Authorization", `Bearer ${authToken}`); // Incluir el token JWT

      expect(response.status).to.equal(404);
      expect(response.body).to.have.property(
        "message",
        "Usuario no encontrado"
      );
    });
  });

  // Pruebas para PUT /usuarios/:cedula
  describe("PUT /usuarios/:cedula", () => {
    it("debería actualizar un usuario existente", async () => {
      const datosActualizados = {
        nombre_completo: "Usuario Actualizado",
        telefono: "1111111111",
      };

      const response = await request(app)
        .put(`/api/v1/usuarios/${testUser.cedula}`)
        .send(datosActualizados);

      expect(response.status).to.equal(200);
      expect(response.body).to.have.property("message", "Usuario actualizado");
      expect(response.body.usuario).to.have.property(
        "nombre_completo",
        "Usuario Actualizado"
      );
    });

    it("debería devolver un error 404 si el usuario no existe", async () => {
      const cedulaInexistente = "000000000";
      const response = await request(app)
        .put(`/api/v1/usuarios/${cedulaInexistente}`)
        .send({ nombre_completo: "No existe" });

      expect(response.status).to.equal(404);
      expect(response.body).to.have.property(
        "message",
        "Usuario no encontrado"
      );
    });
  });

  // Pruebas para DELETE /usuarios/:cedula
  describe("DELETE /usuarios/:cedula", () => {
    it("debería eliminar un usuario existente", async () => {
      const response = await request(app)
        .delete(`/api/v1/usuarios/${testUser.cedula}`)
        .set("Authorization", `Bearer ${authToken}`); // Incluir el token JWT

      expect(response.status).to.equal(200);
      expect(response.body).to.have.property("message", "Usuario eliminado");
    });

    it("debería devolver un error 404 si el usuario no existe", async () => {
      const cedulaInexistente = "000000000";
      const response = await request(app)
        .delete(`/api/v1/usuarios/${cedulaInexistente}`)
        .set("Authorization", `Bearer ${authToken}`); // Incluir el token JWT

      expect(response.status).to.equal(404);
      expect(response.body).to.have.property(
        "message",
        "Usuario no encontrado"
      );
    });
  });

  // Pruebas para POST /login
  // Pruebas para POST /login
  describe("POST /login", () => {
    it("debería iniciar sesión y devolver un token JWT", async () => {
      const credenciales = {
        email: "admin@admin.com", // Asegúrate de que este correo coincida con el del usuario de prueba
        contrasena: "admin", // Asegúrate de que esta contraseña coincida con la del usuario de prueba
      };

      const response = await request(app)
        .post("/api/v1/login")
        .send(credenciales);

      expect(response.status).to.equal(200);
      expect(response.body).to.have.property("token");
      expect(response.body).to.have.property("message", "Login exitoso");
    });

    it("debería devolver un error 404 si el usuario no existe", async () => {
      const credencialesInvalidas = {
        email: "nonexistent@example.com",
        contrasena: "password123",
      };

      const response = await request(app)
        .post("/api/v1/login")
        .send(credencialesInvalidas);

      expect(response.status).to.equal(404);
      expect(response.body).to.have.property(
        "message",
        "Usuario no encontrado"
      );
    });

    it("debería devolver un error 401 si la contraseña es incorrecta", async () => {
      const credencialesInvalidas = {
        email: "admin@admin.com", // Asegúrate de que este correo coincida con el del usuario de prueba
        contrasena: "wrongpassword", // Contraseña incorrecta
      };

      const response = await request(app)
        .post("/api/v1/login")
        .send(credencialesInvalidas);

      expect(response.status).to.equal(401);
      expect(response.body).to.have.property(
        "message",
        "Contraseña incorrecta"
      );
    });
  });
});
