import { Model, DataTypes } from 'sequelize';
import sequelize from '../baseDatos/connection.js';

class Factura extends Model {}

Factura.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  codigo_factura: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  cedula: {
    type: DataTypes.STRING,
    allowNull: false
  },
  nombre_completo: {
    type: DataTypes.STRING
  },
  email_usuario: {
    type: DataTypes.STRING
  },
  direccion_envio: {
    type: DataTypes.STRING
  },
  telefono: {
    type: DataTypes.STRING
  },
  precio_envio: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 3500
  },
  sub_total: {
    type: DataTypes.DECIMAL(10, 2)
  },
  total: {
    type: DataTypes.DECIMAL(10, 2)
  },
  nombre_pagina: {
    type: DataTypes.STRING,
    defaultValue: 'Mr.Wolf'
  },
  fecha_emision: {
    type: DataTypes.DATE, 
    allowNull: false,
  },
}, {
  sequelize,
  modelName: 'Factura',
  tableName: 'Factura',
  timestamps: false
});

export default Factura;
