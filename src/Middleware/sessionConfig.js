import session from "express-session";
import connectRedis from "connect-redis";
import Redis from "ioredis";

// Configuración segura para Azure Redis
const redisClient = new Redis(process.env.REDIS_URL, {
  tls: {
    rejectUnauthorized: false // Necesario para Azure Redis
  },
  reconnectOnError: (err) => {
    console.log("Error de Redis:", err.message);
    return true; // Reconectar automáticamente
  }
});

// Manejo explícito de errores
redisClient.on("error", (err) => {
  console.error("❌ Error en Redis:", err);
});

const RedisStore = connectRedis(session);

const sessionMiddleware = session({
  store: new RedisStore({ 
    client: redisClient,
    disableTouch: true // Mejor rendimiento en Azure
  }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // true en Azure
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 86400000
  }
});

console.log("✅ Middleware de sesión listo");

export default sessionMiddleware;