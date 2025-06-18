import session from "express-session";
import connectRedis from "connect-redis";
import Redis from "ioredis";

// Crear un cliente Redis con la URL de entorno y configuración TLS
const redisClient = new Redis(process.env.REDIS_URL, {
  tls: {} // Asegura que la conexión sea segura (SSL/TLS)
});

// Escuchar eventos de error en Redis
redisClient.on("error", (err) => {
  console.error("Error en Redis:", err);
});

// Crear el store de Redis para las sesiones
const RedisStore = connectRedis(session);

// Configurar el middleware de sesión
const sessionMiddleware = session({
  store: new RedisStore({ client: redisClient }),
  secret: process.env.SESSION_SECRET,
  resave: false, // Mejor práctica
  saveUninitialized: false, // No guardar sesiones vacías
  cookie: {
    httpOnly: true, // Asegura que la cookie no sea accesible vía JavaScript
    secure: process.env.NODE_ENV === "production", // Solo en producción
    sameSite: "lax", // 'none' si usas HTTPS y cookies cross-origin
    maxAge: 24 * 60 * 60 * 1000 // Duración de la sesión: 1 día
  }
});

export default sessionMiddleware;
