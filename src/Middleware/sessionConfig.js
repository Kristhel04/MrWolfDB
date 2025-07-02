import session from 'express-session';
import connectSessionSequelize from 'connect-session-sequelize';
import { sequelize } from './models/index.js'; // tu conexión Sequelize

const SequelizeStore = connectSessionSequelize(session);

const sessionStore = new SequelizeStore({
  db: sequelize,
  tableName: 'Sessions', // puedes cambiar el nombre si querés
  checkExpirationInterval: 15 * 60 * 1000, // limpia sesiones expiradas cada 15 minutos
  expiration: 2 * 60 * 60 * 1000 // duración de la sesión: 2 horas
});

// crea la tabla automáticamente si no existe
sessionStore.sync();

const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET,
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  rolling: true,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    httpOnly: true,
    maxAge: 2 * 60 * 60 * 1000 
  }
});

export default sessionMiddleware;
