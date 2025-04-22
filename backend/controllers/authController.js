const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Validação de e-mail simples
const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

const authController = {
  register: async (req, res) => {
    try {
      const { email, password } = req.body;

      // Validações básicas
      if (!email || !password) {
        return res.status(400).json({ message: 'Email e senha são obrigatórios' });
      }

      if (!validateEmail(email)) {
        return res.status(400).json({ message: 'Email inválido' });
      }

      if (password.length < 6) {
        return res.status(400).json({ message: 'Senha deve ter pelo menos 6 caracteres' });
      }

      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: 'Email já cadastrado' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const userId = await User.create(email, hashedPassword);

      // Gera token automaticamente após registro
      const token = jwt.sign(
        { userId },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      res.status(201).json({ 
        message: 'Usuário criado com sucesso',
        userId,
        token,
        expiresIn: 3600
      });

    } catch (error) {
      console.error('Erro ao registrar:', error);
      res.status(500).json({ 
        message: 'Erro no servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : null
      });
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: 'Email e senha são obrigatórios' });
      }

      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(401).json({ message: 'Credenciais inválidas' });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Credenciais inválidas' });
      }

      if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET não configurado');
      }

      const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      res.json({
        message: 'Login realizado com sucesso',
        token,
        userId: user.id,
        expiresIn: 3600,
        user: {
          email: user.email,
          id: user.id
        }
      });

    } catch (error) {
      console.error('Erro no login:', error);
      res.status(500).json({ 
        message: 'Erro no servidor',
        error: error.message.includes('JWT_SECRET') 
          ? 'Erro de configuração do servidor' 
          : null
      });
    }
  },

  getProfile: async (req, res) => {
    try {
      const user = await User.findById(req.userId);
      if (!user) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }

      // Não retornar a senha
      const { password, ...userData } = user;
      res.json(userData);

    } catch (error) {
      console.error('Erro ao obter perfil:', error);
      res.status(500).json({ message: 'Erro ao buscar perfil' });
    }
  }
};

module.exports = authController;