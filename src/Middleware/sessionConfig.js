import session from "express-session";
import RedisStore from "connect-redis";
import Redis from "ioredis";

const redisClient = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD,
  tls: {} // Necesario si usás Redis en Azure con SSL
});

const sessionMiddleware = session({
  store: new RedisStore({ client: redisClient }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: true,     // ✅ true en producción con HTTPS
    sameSite: "none", // ✅ para trabajar con 
    maxAge: 24 * 60 * 60 * 1000
  }
});

export default sessionMiddleware;
