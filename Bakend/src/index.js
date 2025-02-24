import app from './app.js'

import express from 'express';
import path from 'path';
import fs from 'fs';

// Esto es equivalente a __dirname en módulos ES
const __dirname = path.resolve();

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});

app.use('/public', express.static(path.join(__dirname, 'public')));

//Rutas
app.get('/', (req, res) => {
    res.send('Hello World!');
  });
  