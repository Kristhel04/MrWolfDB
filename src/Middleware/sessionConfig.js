import session from "express-session";
console.log("Middleware de sesión cargado correctamente");


const sessionMiddleware = session({
    secret: process.env.SESSION_SECRET, 
    resave: true,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        secure: true, // Asegúrate de que esté en false en local, pero en producción debe ser true
        sameSite: "lax", // Cambia a 'none' si usas HTTPS en producción
        maxAge: 24 * 60 * 60 * 1000 // 1 día
    } // 1 día de duración
});

export default sessionMiddleware;