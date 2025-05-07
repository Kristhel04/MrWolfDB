import { DataTypes } from 'sequelize';
import sequelize from '../baseDatos/connection.js';
import Usuario from './UsuarioModel.js';
import Producto from './ProductoModel.js';

const Resena = sequelize.define("Resena", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  cedula_usuario: {
    type: DataTypes.STRING,
  },
  id_producto: {
    type: DataTypes.INTEGER,
  },
  calificacion: {
    type: DataTypes.INTEGER,
    validate: {
      min: 1,
      max: 5,
    },
  },
  comentario: {
    type: DataTypes.TEXT,
  },
  fecha: {
    type: DataTypes.DATEONLY,  // Almacena solo la fecha
    defaultValue: DataTypes.NOW,  // Funciona bien con DATEONLY
  },
}, {
  tableName: 'Resenas',
  timestamps: false
});

// Relaciones con alias
Resena.belongsTo(Usuario, {
  foreignKey: 'cedula_usuario',
  targetKey: 'cedula',
  as: 'usuario'
});

Resena.belongsTo(Producto, {
 foreignKey: 'id_producto',
  targetKey: 'id',
  as: 'producto'
});

export default Resena;
