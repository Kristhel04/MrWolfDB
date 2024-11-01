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
            const { cedula,nombre_usuario, nombre_completo, email, contrasena, telefono, direccion_envio, email_facturacion, imagen, rol } = req.body;
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
    
    async getUserById(req,res) {
        try {
            const {cedula} = req.params;
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
        const { email, contraseña } = req.body;
        
        try {
            // Buscar usuario por email
            const usuario = await Usuario.findOne({ where: { email } });
            
            if (!usuario) {
                return res.status(404).json({ message: "Usuario no encontrado" });
            }
            
            // Comparar la contraseña
            const match = await bcrypt.compare(contraseña, usuario.contraseña);
            
            if (!match) {
                return res.status(401).json({ message: "Contraseña incorrecta" });
            }
            
            // Generar token JWT
            const token = jwt.sign(
                {
                    cedula: usuario.cedula,
                    rol: usuario.rol
                },
                process.env.JWT_SECRET, 
                { expiresIn: '1h' },// El token expira en 1 hora
                console.log("JWT_SECRET:", process.env.JWT_SECRET)
            );
            
            res.json({
                message: "Login exitoso",
                token,
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
}

export default new UsuarioController(); 
