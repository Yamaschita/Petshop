const Pet = require('../models/Pet');

const petController = {
    createPet: async (req, res) => {
        try {
            const { pet_name, breed, appointment_date, observations } = req.body;
            const image_path = req.file ? req.file.path : null;
            
            const petData = {
                pet_name,
                breed,
                appointment_date,
                observations,
                image_path
            };
            
            // Criando um pet com o id do usuário (assumindo que req.userId é preenchido corretamente)
            const petId = await Pet.create(req.userId, petData);
            
            res.status(201).json({ message: 'Agendamento criado com sucesso', petId });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Erro ao criar agendamento' });
        }
    },
    
    getPets: async (req, res) => {
        try {
            const pets = await Pet.findByUser(req.userId);
            
            // Adicione esta verificação
            if (!pets || !Array.isArray(pets)) {
                return res.json([]); // Retorna array vazio se não houver resultados
            }
            
            res.json(pets);
        } catch (error) {
            console.error(error);
            res.status(500).json({ 
                message: 'Erro ao obter agendamentos',
                error: error.message // Adiciona mensagem de erro para debug
            });
        }
    },
    
    updatePet: async (req, res) => {
        try {
            const { id } = req.params;
            const { pet_name, breed, appointment_date, observations } = req.body;
            const image_path = req.file ? req.file.path : req.body.existing_image;
            
            // Verifica se o agendamento pertence ao usuário
            const pet = await Pet.findById(id);
            if (!pet || pet.user_id !== req.userId) {
                return res.status(404).json({ message: 'Agendamento não encontrado' });
            }
            
            const petData = {
                pet_name,
                breed,
                appointment_date,
                observations,
                image_path
            };
            
            await Pet.update(id, petData);
            
            res.json({ message: 'Agendamento atualizado com sucesso' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Erro ao atualizar agendamento' });
        }
    },
    
    deletePet: async (req, res) => {
        try {
            const { id } = req.params;
            
            // Verifica se o agendamento pertence ao usuário
            const pet = await Pet.findById(id);
            if (!pet || pet.user_id !== req.userId) {
                return res.status(404).json({ message: 'Agendamento não encontrado' });
            }
            
            await Pet.delete(id);
            
            res.json({ message: 'Agendamento excluído com sucesso' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Erro ao excluir agendamento' });
        }
    }
};


// Exemplo para createPet:
createPet: async (req, res) => {
    try {
        console.log('Dados recebidos:', req.body); // Debug
        console.log('Arquivo recebido:', req.file); // Debug
        
        const { pet_name, breed, appointment_date, observations } = req.body;
        const image_path = req.file ? req.file.path : null;
        
        const petData = {
            pet_name,
            breed,
            appointment_date,
            observations,
            image_path
        };
        
        const petId = await Pet.create(req.userId, petData);
        console.log('Pet criado com ID:', petId); // Debug
        
        res.status(201).json({ 
            message: 'Agendamento criado com sucesso',
            petId,
            imageUrl: image_path ? `${req.protocol}://${req.get('host')}/${image_path.replace(/\\/g, '/')}` : null
        });

    } catch (error) {
        console.error('Erro detalhado:', error);
        res.status(500).json({ 
            message: 'Erro ao criar agendamento',
            error: process.env.NODE_ENV === 'development' ? error.message : null
        });
    }
    // No sucesso da criação:
showMessage('Agendamento criado com sucesso!');
modal.style.display = 'none';
loadAppointments(); // Recarrega a lista

// Adicione um pequeno delay se necessário
setTimeout(loadAppointments, 500);
}


module.exports = petController;
