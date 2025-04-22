const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); // Middleware de autenticação
const upload = require('../middleware/upload'); //  Configuração do Multer
const petController = require('../controllers/petController'); //  Controllers

// Rotas:
router.get('/', auth, petController.getPets); //
router.post('/', auth, upload.single('image'), petController.createPet); // 
router.get('/', auth, petController.getPets); 
router.put('/:id', auth, upload.single('image'), petController.updatePet); 
router.delete('/:id', auth, petController.deletePet); 

module.exports = router;