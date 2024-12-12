import express from 'express';
import produtosRoutes from './routes/produtos';
import clientesRoutes from './routes/clientes';
import avaliacoesRoutes from './routes/avaliacoes';
import dashboardRoutes from './routes/dashboard'; 
import adminRoutes from './routes/admin';
import cors from 'cors';

const app = express();
const port = 3004;

app.use(express.json());
app.use(cors());

// Associando as rotas aos seus respectivos endpoints
app.use("/produtos", produtosRoutes);
app.use("/clientes", clientesRoutes);
app.use("/avaliacoes", avaliacoesRoutes);
app.use("/admin", adminRoutes); // Corrigido
app.use("/dashboard", dashboardRoutes); // Corrigido

// Rota padrão
app.get('/', (req, res) => {
  res.send('API: Sistema de Revenda de produtos');
});

// Iniciando o servidor
app.listen(port, () => {
  console.log(`Servidor rodando na porta: ${port}`);
});
