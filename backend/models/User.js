const db = require('../config/db'); // Importa a configuração do banco de dados

const User = {
    create: async (email, password) => {
        const [result] = await db.pool.query( // usa pool diretamente aqui
            'INSERT INTO users (email, password) VALUES (?, ?)',
            [email, password]
        );
        return result.insertId; // pega o ID do novo usuário
    },

    findByEmail: async (email) => {
        const [rows] = await db.pool.query(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );
        return rows[0]; // retorna o primeiro (se existir)
    },

    findById: async (id) => {
        const [rows] = await db.pool.query(
            'SELECT * FROM users WHERE id = ?',
            [id]
        );
        return rows[0];
    }
};

module.exports = User;
