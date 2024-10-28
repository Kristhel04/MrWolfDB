import jwt from 'jsonwebtoken';
 
// Middleware para autenticar el token JWT
export const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(403).json({ message: 'Token requerido' });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: 'Token inválido' });

        req.user = user; // Almacena el usuario en el objeto req
        next();
    });
    console.log('JWT_SECRET:', process.env.JWT_SECRET);
    console.log("Token recibido:", token);

};

// Middleware para autorizar roles específicos
export const authorizeRole = (rolesPermitidos) => {
    return (req, res, next) => {
        const { rol } = req.user; // El rol fue añadido en authenticateToken
        console.log("Rol recibido:", rol);
        if (!rolesPermitidos.includes(rol)) {
            return res.status(403).json({ message: 'Acceso denegado' });
        }
        next();
    };
};
