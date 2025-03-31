const session = require('express-session');

const sessionMiddleware = session({
    secret: process.env.SESSION_SECRET, 
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true } // Cambia a true si usas HTTPS
});

module.exports = sessionMiddleware;
