require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./config/db');
const path = require('path');
const auth = require('./middleware/auth');
const authController = require('./controllers/authController'); // Adicione esta linha

const app = express();

// Configuração do CORS
const corsOptions = {
    origin: 'http://localhost:5500',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Conexão com o banco de dados
db.testConnection();

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, '../frontend')));

// Rotas públicas
app.post('/api/auth/register', authController.register);
app.post('/api/auth/login', authController.login);
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'API está funcionando' });
});

// Rotas protegidas
const petRoutes = require('./routes/petRoutes');
app.use('/api/pets', auth, petRoutes);

// Pasta de uploads
app.use('/uploads', express.static('uploads'));

// Rota para a raiz
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Tratamento de erros
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Erro interno no servidor' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`Acesse: http://localhost:${PORT}`);
});