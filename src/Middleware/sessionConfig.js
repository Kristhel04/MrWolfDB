import session from "express-session";
console.log("Middleware de sesión cargado correctamente");


const sessionMiddleware = session({
    secret: process.env.SESSION_SECRET, 
    resave: true,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        secure: true,           // ✅ importante: true si usas HTTPS
        sameSite: "none",       // ✅ permite compartir cookies entre dominios
        maxAge: 24 * 60 * 60 * 1000 // 1 día
    }
});

export default sessionMiddleware;
