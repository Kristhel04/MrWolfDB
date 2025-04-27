import Usuario from "../model/UsuarioModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

class UsuarioController {
  async getAllUsers(req, res) {
    try {
      const usuarios = await Usuario.findAll();
      res.json(usuarios);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener los usuarios", error });
    }
  }

  async createUser(req, res) {
    try {
      console.log("Datos recibidos :", req.body);
      const {
        cedula,
        nombre_usuario,
        nombre_completo,
        email,
        contrasena,
        telefono,
        direccion_envio,
        email_facturacion,
        imagen,
        rol,
      } = req.body;
      const salt = await bcrypt.genSalt(10);
      const contraseñaEncriptada = await bcrypt.hash(contrasena, salt);

      const nuevoUsuario = await Usuario.create({
        cedula,
        nombre_usuario,
        nombre_completo,
        email,
        contrasena: contraseñaEncriptada,
        telefono,
        direccion_envio,
        email_facturacion,
        imagen,
        rol,
      });

      res.json({ message: "Usuario creado", nuevoUsuario });
    } catch (error) {
      res.status(500).json({ message: "Error al crear el usuario", error });
    }
  }

  async getUserById(req, res) {
    try {
      const { cedula } = req.params;
      const usuario = await Usuario.findByPk(cedula);
      if (!usuario) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }

      res.json(usuario);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener el usuario", error });
    }
  }

  async updateUser(req, res) {
    try {
      let { cedula } = req.params;
      cedula = cedula.trim();

      const {
        nombre_usuario,
        nombre_completo,
        email,
        contraseña,
        telefono,
        direccion_envio,
        email_facturacion,
        imagen,
        rol,
      } = req.body;

      const usuario = await Usuario.findOne({ where: { cedula } });
      if (!usuario) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }

      let nuevaContraseña;
      if (contraseña) {
        const salt = await bcrypt.genSalt(10);
        nuevaContraseña = await bcrypt.hash(contraseña, salt);
      }

      await usuario.update({
        nombre_usuario,
        nombre_completo,
        email,
        contraseña: nuevaContraseña || usuario.contraseña,
        telefono,
        direccion_envio,
        email_facturacion,
        imagen,
        rol,
      });

      res.json({ message: "Usuario actualizado", usuario });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error al actualizar el usuario", error });
    }
  }

  async login(req, res) {
    console.log("Datos recibidos:", req.body);
    const { email, contrasena } = req.body;

    try {
      // Buscar usuario por email
      const usuario = await Usuario.findOne({ where: { email } });

      if (!usuario) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }

      // Comparar la contraseña
      const match = await bcrypt.compare(contrasena, usuario.contrasena);

      if (!match) {
        return res.status(401).json({ message: "Contraseña incorrecta" });
      }

      // Generar token JWT
      const token = jwt.sign(
        {
          cedula: usuario.cedula,
          rol: usuario.rol,
        },
        process.env.JWT_SECRET,
        { expiresIn: "1h" } // El token expira en 1 hora
      );

      console.log("JWT_SECRET:", process.env.JWT_SECRET); // Mueve el console.log fuera de jwt.sign
      console.log("Token generado:", token);
      res.json({
        message: "Login exitoso",
        token,
        usuario: {
          cedula: usuario.cedula,
          nombre_completo: usuario.nombre_completo,
          rol: usuario.rol,
        },
      });
    } catch (error) {
      res.status(500).json({ message: "Error en el login", error });
    }
  }

  async logout(req, res) {
    try {
      // Limpiar el carrito de la sesión
      if (req.session) {
        req.session.cart = []; // Vacía el carrito de la sesión
      }

      // Elimina la cookie del refreshToken
      res.clearCookie("refreshToken");

      // Finaliza la sesión
      req.session.destroy((err) => {
        if (err) {
          return res
            .status(500)
            .json({ message: "Error al cerrar sesión", error: err });
        }

        res.json({
          message: "Sesión cerrada exitosamente y carrito limpiado.",
        });
      });
    } catch (error) {
      res.status(500).json({ message: "Error al cerrar sesión", error });
    }
  }

  async deleteUser(req, res) {
    try {
      const { cedula } = req.params;
      const usuario = await Usuario.findByPk(cedula);
      if (!usuario) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }

      await usuario.destroy();
      res.json({ message: "Usuario eliminado" });
    } catch (error) {
      res.status(500).json({ message: "Error al eliminar el usuario", error });
    }
  }
  async refreshToken(req, res) {
    const refreshToken = req.cookies.refreshToken; // Obtén el refreshToken de las cookies
    if (!refreshToken) {
      return res
        .status(401)
        .json({ message: "Refresh token no proporcionado" });
    }

    try {
      // Verifica el refreshToken
      const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);

      // Genera un nuevo accessToken
      const accessToken = jwt.sign(
        { cedula: decoded.cedula, rol: decoded.rol },
        process.env.JWT_SECRET,
        { expiresIn: "1h" } // El nuevo accessToken expira en 1 hora
      );

      // Devuelve el nuevo accessToken
      res.json({ accessToken });
    } catch (error) {
      console.error("Error al refrescar el token:", error);
      res.status(403).json({ message: "Refresh token inválido o expirado" });
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
  
      // Llamada directa al método con parámetros
      await UsuarioController.actualizarContrasenaDirecto(email, nuevaContrasena);
      
      await registro.destroy();
      res.json({ message: "Contraseña actualizada correctamente" });
    } catch (error) {
      console.error("💥 Error al restablecer contraseña:", error);
      res.status(500).json({ message: "Error al restablecer contraseña", error });
    }
  }

}

export default new UsuarioController();
