import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { DateTime } from "luxon";
import Factura from "../model/FacturaModel.js";
import DetalleFactura from "../model/DetalleFacturaModel.js";
import Usuario from "../model/UsuarioModel.js";

const pdfDir = path.join("public", "facturasPDF");
if (!fs.existsSync(pdfDir)) {
  fs.mkdirSync(pdfDir, { recursive: true });
}

const generarCodigoFactura = () => {
  const fechaBase36 = Date.now().toString(36);
  const aleatorio = Math.floor(Math.random() * 1000);
  return `FAC-${fechaBase36}-${aleatorio}`;
};

const FacturaController = {
  async create(req, res) {
    try {
      // 1. Verificación más robusta del usuario autenticado
      if (!req.user || !req.user.cedula) {
        console.error("Error de autenticación - req.user:", req.user);
        return res.status(401).json({ 
          message: "No se pudo identificar al usuario. Por favor inicie sesión nuevamente." 
        });
      }

      // 2. Obtenemos los datos del usuario desde el token
      const { cedula } = req.user;
      const productos = req.body.productos;

      console.log("Datos recibidos para factura:", {
        cedulaUsuario: cedula,
        productos: productos
      });

      // 3. Validación de productos
      if (!productos || !Array.isArray(productos) || productos.length === 0) {
        return res.status(400).json({ 
          message: "Debe seleccionar al menos un producto para generar la factura." 
        });
      }

      // 4. Buscar al usuario en la base de datos
      const user = await Usuario.findOne({ 
        where: { cedula },
        attributes: ['cedula', 'nombre_completo', 'email_facturacion', 'direccion_envio', 'telefono']
      });

      if (!user) {
        console.error("Usuario no encontrado con cédula:", cedula);
        return res.status(404).json({ 
          message: "Usuario no registrado en el sistema. Por favor complete su perfil primero." 
        });
      }

      // 5. Cálculos de la factura
      const subTotal = productos.reduce((acc, prod) => acc + (prod.precio * prod.quantity), 0);
      const precioEnvio = 3500;
      const total = subTotal + precioEnvio;

      // 6. Creación de la factura
      const nuevaFactura = await Factura.create({
        codigo_factura: generarCodigoFactura(),
        cedula: user.cedula,
        nombre_completo: user.nombre_completo,
        email_usuario: user.email_facturacion,
        direccion_envio: user.direccion_envio,
        telefono: user.telefono,
        sub_total: subTotal,
        precio_envio: precioEnvio,
        total: total,
        nombre_pagina: "Mr.Wolf",
        fecha_emision: DateTime.now().setZone("America/Costa_Rica").toFormat("yyyy-MM-dd"),
      });
      console.log("ID de factura generada:", nuevaFactura.id);

      // 7. Creación de detalles
      const detalles = await Promise.all(
        productos.map(async (prod) => {
          return await DetalleFactura.create({
            factura_id: nuevaFactura.id,
            producto_id: prod.id,
            talla_id: prod.tallaId,
            nombre_producto: prod.nombre,
            precio_unitario: prod.precio,
            cantidad: prod.quantity,
            total: prod.precio * prod.quantity,
          });
        })
      );

      // 8. Respuesta exitosa
      return res.status(201).json({
        success: true,
        message: "Factura generada correctamente",
        factura: {
          id: nuevaFactura.id,
          codigo: nuevaFactura.codigo_factura,
          total: nuevaFactura.total,
          fecha: nuevaFactura.fecha_emision
        },
        productos: detalles.map(d => ({
          nombre: d.nombre_producto,
          cantidad: d.cantidad,
          precio: d.precio_unitario
        }))
      });

    } catch (error) {
      console.error("Error completo al crear factura:", error);
      return res.status(500).json({ 
        success: false,
        message: "Error interno al procesar la factura",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  async getFacturasUsuario(req, res) {
    try {
      const usuario = req.user;
      const facturas = await Factura.findAll({ where: { cedula_usuario: usuario.cedula } });
      res.status(200).json(facturas);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener facturas del usuario", error });
    }
  },

  async getAll(req, res) {
    try {
      if (req.user.rol !== "admin") {
        return res.status(403).json({ message: "No autorizado" });
      }

      const facturas = await Factura.findAll();
      res.status(200).json(facturas);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener todas las facturas", error });
    }
  },

  async generarFacturaPDF(req, res) {
    try {
      const { id } = req.params;
      const factura = await Factura.findByPk(id);
      const detalles = await DetalleFactura.findAll({ where: { id_factura: id } });

      if (!factura) {
        return res.status(404).json({ message: "Factura no encontrada" });
      }

      const doc = new PDFDocument();
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename=factura_${id}.pdf`);
      doc.pipe(res);

      doc.fontSize(20).text("Factura MrWolf", { align: "center" });
      doc.moveDown();

      // 👉 Formato CR para la fecha en PDF
      const fecha = new Date(factura.fecha_emision);
      const formatoCR = new Intl.DateTimeFormat("es-CR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
        timeZone: "America/Costa_Rica",
      }).format(fecha);

      doc.fontSize(12).text(`Cliente: ${factura.nombre_completo}`);
      doc.text(`Email: ${factura.email_usuario}`);
      doc.text(`Dirección: ${factura.direccion_envio}`);
      doc.text(`Fecha de emisión: ${formatoCR}`);
      doc.moveDown();

      doc.text("Detalles de la factura:");
      detalles.forEach((d, index) => {
        doc.text(`${index + 1}. ${d.nombre_producto} - Cantidad: ${d.cantidad} - ₡${d.precio_unitario}`);
      });

      doc.moveDown();
      doc.text(`Subtotal: ₡${factura.sub_total}`);
      doc.text(`Envío: ₡${factura.precio_envio}`);
      doc.text(`Total: ₡${factura.total}`);

      doc.end();
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al generar el PDF" });
    }
  },
};

export default FacturaController;
