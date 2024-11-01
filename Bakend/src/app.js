import express from 'express'
import usuariosR from "./router/Usuario.routes.js"
import 'dotenv/config';
import cors from 'cors';

const app = express()
app.use(cors());
app.use(express.json());

app.use('/api/v1', usuariosR);

export default app