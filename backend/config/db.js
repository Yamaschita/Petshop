const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Testar a conexão ao iniciar
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('Conexão com o MySQL estabelecida com sucesso!');
        connection.release();
    } catch (error) {
        console.error('Erro ao conectar ao MySQL:', error);
        process.exit(1);
    }
}

module.exports = {
    pool,
    query: async (sql, params) => {
        const [rows] = await pool.query(sql, params);
        return rows;
    },
    testConnection
    
};

