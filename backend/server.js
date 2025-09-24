import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

import cnpjRoutes from './routes/cnpj.js';
import respostasRoutes from './routes/respostas.js';

const app = express();

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// Rotas
app.use('/api', cnpjRoutes);
app.use('/api', respostasRoutes);

// Teste rápido
app.get('/', (req, res) => res.send('Backend rodando!'));

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
