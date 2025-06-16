import { Model, DataTypes } from 'sequelize';
import sequelize from '../baseDatos/connection.js';

class CodigoRecuperacion extends Model {}

CodigoRecuperacion.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false
  },
  codigo: {
    type: DataTypes.STRING,
    allowNull: false
  },
  expiracion: {
    type: DataTypes.DATE,
    allowNull: false
  }
}, {
  sequelize,
  modelName: 'CodigoRecuperacion',
  tableName: 'CodigosRecuperacion',
  timestamps: false
});

export default CodigoRecuperacion;
