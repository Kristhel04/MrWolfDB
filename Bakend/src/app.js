import express from 'express'
import usuariosR from "./router/Usuario.routes.js"
import 'dotenv/config';


const app = express()

app.use(express.json());

app.use('/api/v1', usuariosR);

export default app