import express from 'express';
import cors from 'cors';
import path from 'path';
import routes from './routes';

const app = express();

app.use(cors());
app.use(routes);
// Cria rota para aquivos estáticos do projeto. Ex: Imagens, Pdfs, etc.
app.use('/uploads', express.static(path.resolve(__dirname, '..', 'uploads')));

app.listen(3333);
