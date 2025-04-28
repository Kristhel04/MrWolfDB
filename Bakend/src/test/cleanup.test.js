// Usa importaciones compatibles con CommonJS
import pkg from 'node-cron';
const { CronJob } = pkg;

import mochaPkg from 'mocha';
const { before, it } = mochaPkg;

import { expect } from 'chai';
import CodigoRecuperacion from '../model/CodigoRecuperacion.js';
import sequelize from '../baseDatos/connection.js';
import { Op } from 'sequelize';

describe('Pruebas de limpieza automática', () => {
  before(async () => {
    await sequelize.sync({ force: true });
  });

  it('debe eliminar códigos expirados', async () => {
    // Crear código expirado
    await CodigoRecuperacion.create({
      email: "test@example.com",
      codigo: "TEST123",
      expiracion: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 día atrás
    });

    // Ejecutar limpieza
    const deleted = await CodigoRecuperacion.destroy({
      where: { expiracion: { [Op.lt]: new Date() } }
    });

    // Verificar
    expect(deleted).to.equal(1);
    const remaining = await CodigoRecuperacion.count();
    expect(remaining).to.equal(0);
  });
});