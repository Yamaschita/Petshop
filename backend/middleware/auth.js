const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        // 1. Verifica se o header Authorization existe
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ message: 'Token não fornecido' });
        }

        // 2. Extrai o token (Bearer <token>)
        const token = authHeader.split(' ')[1];
        
        // 3. Verifica o token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // 4. Adiciona o ID do usuário à requisição
        req.userId = decoded.userId;
        
        next();
    } catch (error) {
        console.error('Erro na autenticação:', error);
        return res.status(401).json({ 
            message: 'Autenticação falhou',
            error: error.message // Adiciona detalhes do erro
        });
    }
};