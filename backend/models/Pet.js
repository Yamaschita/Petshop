const db = require('../config/db');

class Pet {
    // Cria um novo agendamento de pet
    static async create(userId, petData) {
        const { pet_name, breed, appointment_date, observations, image_path } = petData;
        try {
            // Modifique esta parte:
            const result = await db.query(
                'INSERT INTO pets (user_id, pet_name, breed, appointment_date, observations, image_path) VALUES (?, ?, ?, ?, ?, ?)',
                [userId, pet_name, breed, appointment_date, observations, image_path]
            );
            
            // Ajuste conforme o formato real do seu resultado:
            const insertId = result.insertId || result[0]?.insertId;
            return insertId;
        } catch (error) {
            console.error("Erro ao criar agendamento:", error);
            throw new Error("Erro ao criar agendamento");
        }
    }
    // Encontra um pet específico pelo ID
    static async findByUser(userId) {
        try {
            const [rows] = await db.query(
                'SELECT * FROM pets WHERE user_id = ? ORDER BY appointment_date',
                [userId]
            );
            return rows || []; // Garante que sempre retorne um array
        } catch (error) {
            console.error("Erro ao buscar pets do usuário:", error);
            throw new Error("Erro ao buscar pets do usuário");
        }
    }

    // Atualiza os dados de um pet
    static async update(id, petData) {
        const { pet_name, breed, appointment_date, observations, image_path } = petData;
        try {
            await db.query(
                'UPDATE pets SET pet_name = ?, breed = ?, appointment_date = ?, observations = ?, image_path = ? WHERE id = ?',
                [pet_name, breed, appointment_date, observations, image_path, id]
            );
        } catch (error) {
            console.error("Erro ao atualizar pet:", error);
            throw new Error("Erro ao atualizar pet");
        }
    }

    // Exclui um pet pelo ID
    static async delete(id) {
        try {
            await db.query(
                'DELETE FROM pets WHERE id = ?',
                [id]
            );
        } catch (error) {
            console.error("Erro ao excluir pet:", error);
            throw new Error("Erro ao excluir pet");
        }
    }
}

module.exports = Pet;
