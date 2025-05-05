import { Model, DataTypes } from 'sequelize';
import sequelize from '../baseDatos/connection.js';

class DetalleFactura extends Model {}

DetalleFactura.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  id_factura: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: 'Factura',
      key: 'id'
    }
  },
  id_producto: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Productos',
      key: 'id'
    }
  },
  nombre_producto: {
    type: DataTypes.STRING
  },
  cantidad: {
    type: DataTypes.INTEGER
  },
  precio_unitario: {
    type: DataTypes.DECIMAL(10, 2)
  },
  subtotal: {
    type: DataTypes.DECIMAL(10, 2)
  }
}, {
  sequelize,
  modelName: 'DetalleFactura',
  tableName: 'DetalleFactura',
  timestamps: false
});

export default DetalleFactura;
