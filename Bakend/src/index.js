import app from './app.js'

import express from 'express';
import path from 'path';
import fs from 'fs';
import TallaController from './Controller/TallaController.js'

// Esto es equivalente a __dirname en módulos ES
const __dirname = path.resolve();

app.use('/public', express.static(path.join(__dirname, 'public')));

//Rutas
app.get('/', (req, res) => {
    res.send('Hello World!');
  });
TallaController.syncAndInsertTallas(); 
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
