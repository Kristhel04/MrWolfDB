import CodigoRecuperacion from "../model/CodigoRecuperacion.js";
import Usuario from "../model/UsuarioModel.js";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import { Op } from "sequelize";
import UsuarioController from "./UsuarioController.js";
const generarCodigo = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_FROM,
    pass: process.env.EMAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false, // ⚠️ Ignora errores de certificado (solo para dev)
  },
});

class RecuperacionController {
  async solicitarCodigo(req, res) {
    const { email } = req.body;
    console.log("📩 Email recibido:", email); // Debug

    try {
      const usuario = await Usuario.findOne({ where: { email } });
      if (!usuario) {
        console.log("❌ Usuario no encontrado.");
        return res.status(404).json({ message: "Correo no encontrado" });
      }

      const codigo = generarCodigo();
      const expiracion = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos
      console.log("🔐 Código generado:", codigo);

      await CodigoRecuperacion.create({ email, codigo, expiracion });
      console.log("✅ Código guardado en la base de datos.");

      // Intento de enviar el correo
      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: email,
        subject: "Código de recuperación de contraseña",
        text: `Tu código es: ${codigo}`,
      });

      console.log("📤 Correo enviado.");
      res.json({ message: "Código enviado por correo" });
    } catch (error) {
      console.error("💥 Error en solicitarCodigo:", error); // Mostramos el error completo
      res
        .status(500)
        .json({ message: "Error al enviar código", error: error.message });
    }
  }

  async verificarCodigo(req, res) {
    const { email, codigo } = req.body;

    try {
      const registro = await CodigoRecuperacion.findOne({
        where: {
          email,
          codigo,
          expiracion: {
            [Op.gt]: new Date(),
          },
        },
      });

      if (!registro) {
        return res.status(400).json({ message: "Código inválido o expirado" });
      }

      res.json({ message: "Código válido" });
    } catch (error) {
      res.status(500).json({ message: "Error al verificar código", error });
    }
  }

  async restablecerContrasena(req, res) {
    const { email, codigo, nuevaContrasena } = req.body;
    try {
      const registro = await CodigoRecuperacion.findOne({
        where: { email, codigo, expiracion: { [Op.gt]: new Date() } },
      });
      if (!registro) {
        return res.status(400).json({ message: "Código inválido o expirado" });
      }
      // Actualizar la contraseña directamente
      const usuario = await Usuario.findOne({ where: { email } });
      if (!usuario) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }
      const salt = await bcrypt.genSalt(10);
      const contrasenaEncriptada = await bcrypt.hash(nuevaContrasena, salt);
      await usuario.update({ contrasena: contrasenaEncriptada });
      // Eliminar el código de recuperación
      await registro.destroy();
      res.json({ message: "Contraseña actualizada correctamente" });
    } catch (error) {
      console.error("💥 Error al restablecer contraseña:", error);
      res.status(500).json({ message: "Error al restablecer contraseña", error });
    }
  }
}

export default new RecuperacionController();
