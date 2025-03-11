import Usuario from '../model/UsuarioModel.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

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
            console.log('Datos recibidos:', req.body);
            const { cedula, nombre_usuario, nombre_completo, email, contrasena, telefono, direccion_envio, email_facturacion, imagen, rol } = req.body;
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
                rol
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

            const { nombre_usuario, nombre_completo, email, contraseña, telefono, direccion_envio, email_facturacion, imagen, rol } = req.body;

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
                rol
            });

            res.json({ message: "Usuario actualizado", usuario });
        } catch (error) {
            res.status(500).json({ message: "Error al actualizar el usuario", error });
        }
    }

    async login(req, res) {
        const { email, contrasena } = req.body;

        try {
            const usuario = await Usuario.findOne({ where: { email } });
            if (!usuario) {
                return res.status(404).json({ message: "Usuario no encontrado" });
            }

            const match = await bcrypt.compare(contrasena, usuario.contrasena);
            if (!match) {
                return res.status(401).json({ message: "Contraseña incorrecta" });
            }

            const accessToken = jwt.sign(
                { cedula: usuario.cedula, rol: usuario.rol },
                process.env.JWT_SECRET,
                { expiresIn: '1h' } // Access Token expira en 1 hora
            );

            const refreshToken = jwt.sign(
                { cedula: usuario.cedula },
                process.env.JWT_SECRET,
                { expiresIn: '7d' } // Refresh Token expira en 7 días
            );

            // Envía el refreshToken en una cookie HTTP-Only
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: true, // Solo en HTTPS
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días
            });

            res.json({
                message: "Login exitoso",
                accessToken,
                usuario: {
                    cedula: usuario.cedula,
                    nombre_completo: usuario.nombre_completo,
                    rol: usuario.rol
                }
            });
        } catch (error) {
            res.status(500).json({ message: "Error en el login", error });
        }
    }

    async logout(req, res) {
        try {
            // Elimina la cookie del refreshToken
            res.clearCookie('refreshToken');
            res.json({ message: 'Sesión cerrada exitosamente' });
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
            return res.status(401).json({ message: 'Refresh token no proporcionado' });
        }

        try {
            // Verifica el refreshToken
            const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);

            // Genera un nuevo accessToken
            const accessToken = jwt.sign(
                { cedula: decoded.cedula, rol: decoded.rol },
                process.env.JWT_SECRET,
                { expiresIn: '1h' } // El nuevo accessToken expira en 1 hora
            );

            // Devuelve el nuevo accessToken
            res.json({ accessToken });
        } catch (error) {
            console.error("Error al refrescar el token:", error);
            res.status(403).json({ message: 'Refresh token inválido o expirado' });
        }
    }
}

export default new UsuarioController(); 
