// Constantes
const API_BASE_URL = 'http://localhost:3000/api';

// ==============================================
// FUNÇÕES UTILITÁRIAS
// ==============================================

/**
 * Exibe mensagens temporárias na tela
 * @param {string} message - Mensagem a ser exibida
 * @param {boolean} isError - Se true, exibe como mensagem de erro
 */
function showMessage(message, isError = false) {
    // Remove mensagens existentes
    const existingMessages = document.querySelectorAll('.success-message, .error-message');
    existingMessages.forEach(msg => msg.remove());
    
    const messageDiv = document.createElement('div');
    messageDiv.className = isError ? 'error-message' : 'success-message';
    messageDiv.textContent = message;
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.style.animation = 'slideIn 0.3s ease-out reverse';
        setTimeout(() => messageDiv.remove(), 300);
    }, 4500);
}

/**
 * Configura o efeito de mostrar/esconder senha
 */
function setupPasswordToggle() {
    document.querySelectorAll('.show-password').forEach(button => {
        button.addEventListener('click', function() {
            const input = this.previousElementSibling;
            input.type = input.type === 'password' ? 'text' : 'password';
            this.textContent = input.type === 'password' ? '👁️' : '👁️';
        });
    });
}

/**
 * Valida um email
 * @param {string} email 
 * @returns {boolean}
 */
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

/**
 * Valida uma senha (mínimo 6 caracteres)
 * @param {string} password 
 * @returns {boolean}
 */
function validatePassword(password) {
    return password.length >= 6;
}

// ==============================================
// FUNÇÃO PRINCIPAL PARA REQUISIÇÕES HTTP
// ==============================================

/**
 * Faz requisições HTTP com tratamento de CORS
 * @param {string} url - Endpoint da API
 * @param {string} method - Método HTTP (GET, POST, etc)
 * @param {object|null} body - Corpo da requisição
 * @param {boolean} requiresAuth - Se requer autenticação
 */
async function makeRequest(url, method, body = null, requiresAuth = false) {
    try {
        const headers = {
            'Content-Type': 'application/json'
        };

        if (requiresAuth) {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Sessão expirada. Faça login novamente.');
            }
            headers['Authorization'] = `Bearer ${token}`;
        }

        const options = {
            method,
            headers,
            credentials: 'include',
            mode: 'cors',
            body: body ? JSON.stringify(body) : null
        };

        const response = await fetch(`${API_BASE_URL}${url}`, options);
        
        if (!response.ok) {
            let errorData;
            try {
                errorData = await response.json();
            } catch {
                errorData = { message: `Erro HTTP ${response.status}` };
            }
            throw new Error(errorData.message || 'Erro na requisição');
        }

        const text = await response.text();
        return text ? JSON.parse(text) : [];
    } catch (error) {
        console.error(`Erro na requisição ${method} ${url}:`, error);
        throw error;
    }
}

// ==============================================
// GERENCIAMENTO DE AUTENTICAÇÃO
// ==============================================

/**
 * Verifica se o usuário está autenticado
 */
function checkAuth() {
    const publicPages = ['index.html', 'login.html', 'cadastro.html'];
    const currentPage = window.location.pathname.split('/').pop();
    
    if (!localStorage.getItem('token') && !publicPages.includes(currentPage)) {
        window.location.href = 'login.html';
    } else if (localStorage.getItem('token') && publicPages.includes(currentPage) && currentPage !== 'index.html') {
        window.location.href = 'agendamentos.html';
    }
}

// Verifica autenticação ao carregar a página
document.addEventListener('DOMContentLoaded', checkAuth);

// ==============================================
// CADASTRO DE USUÁRIO
// ==============================================

if (document.getElementById('registerForm')) {
    setupPasswordToggle();

    document.getElementById('registerForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        try {
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;

            // Validações
            if (!validateEmail(email)) {
                throw new Error('Por favor, insira um email válido');
            }

            if (!validatePassword(password)) {
                throw new Error('A senha deve ter pelo menos 6 caracteres');
            }

            if (password !== confirmPassword) {
                throw new Error('As senhas não coincidem');
            }

            showMessage('Processando cadastro...');
            
            await makeRequest('/auth/register', 'POST', { email, password });
            
            showMessage('Cadastro realizado com sucesso! Redirecionando...');
            setTimeout(() => window.location.href = 'login.html', 1500);
        } catch (error) {
            showMessage(`Falha no cadastro: ${error.message}`, true);
        }
    });
}

// ==============================================
// LOGIN DE USUÁRIO
// ==============================================

if (document.getElementById('loginForm')) {
    setupPasswordToggle();

    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        try {
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            if (!email || !password) {
                throw new Error('Por favor, preencha todos os campos');
            }

            showMessage('Autenticando...');
            
            const response = await makeRequest('/auth/login', 'POST', {
                email,
                password
            });

            localStorage.setItem('token', response.token);
            localStorage.setItem('userId', response.userId);
            
            showMessage('Login realizado! Redirecionando...');
            setTimeout(() => window.location.href = 'agendamentos.html', 1000);
        } catch (error) {
            showMessage(`Falha no login: ${error.message}`, true);
        }
    });
}

// ==============================================
// LOGOUT
// ==============================================

if (document.getElementById('logoutBtn')) {
    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        showMessage('Logout realizado com sucesso!');
        setTimeout(() => window.location.href = 'index.html', 1000);
    });
}

// ==============================================
// GERENCIAMENTO DE AGENDAMENTOS
// ==============================================

if (document.getElementById('appointmentsList')) {
    checkAuth();
    
    const token = localStorage.getItem('token');
    const modal = document.getElementById('appointmentForm');
    const form = document.getElementById('petForm');

    // Configuração do modal
    document.getElementById('newAppointmentBtn').addEventListener('click', () => {
        form.reset();
        document.getElementById('petId').value = '';
        document.getElementById('imagePreview').innerHTML = '';
        document.getElementById('formTitle').textContent = 'Novo Agendamento';
        modal.style.display = 'block';
    });

    document.querySelector('.close').addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) modal.style.display = 'none';
    });

    // Preview de imagem
    document.getElementById('petImage').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (event) => {
            document.getElementById('imagePreview').innerHTML = `
                <img src="${event.target.result}" alt="Preview" class="image-preview">
            `;
        };
        reader.readAsDataURL(file);
    });

    /**
     * Carrega a lista de agendamentos
     */
    async function loadAppointments() {
        try {
            showMessage('Carregando agendamentos...');
            
            const appointments = await makeRequest('/pets', 'GET', null, true);
            const container = document.getElementById('appointmentsList');
            container.innerHTML = '';

            if (!appointments || appointments.length === 0) {
                container.innerHTML = `
                    <div class="no-appointments">
                        <p>Nenhum agendamento encontrado</p>
                        <button id="newAppointmentBtnEmpty" class="btn">Agendar agora</button>
                    </div>
                `;
                document.getElementById('newAppointmentBtnEmpty').addEventListener('click', () => {
                    document.getElementById('newAppointmentBtn').click();
                });
                return;
            }

            appointments.forEach(appointment => {
                const card = document.createElement('div');
                card.className = 'appointment-card';
                
                const imageUrl = appointment.image_path 
                    ? `${API_BASE_URL}/${appointment.image_path.replace(/\\/g, '/')}`
                    : null;

                card.innerHTML = `
                    <div class="pet-image">
                        ${imageUrl 
                            ? `<img src="${imageUrl}" alt="${appointment.pet_name}">`
                            : '<div class="no-image">Sem imagem</div>'}
                    </div>
                    <div class="pet-info">
                        <h3>${appointment.pet_name}</h3>
                        <p><strong>Raça:</strong> ${appointment.breed}</p>
                        <p><strong>Data:</strong> ${formatDate(appointment.appointment_date)}</p>
                        ${appointment.observations ? `<p><strong>Observações:</strong> ${appointment.observations}</p>` : ''}
                    </div>
                    <div class="pet-actions">
                        <button class="btn edit-btn" data-id="${appointment.id}">Editar</button>
                        <button class="btn btn-danger delete-btn" data-id="${appointment.id}">Excluir</button>
                    </div>
                `;
                
                container.appendChild(card);
            });

            // Adiciona eventos aos botões
            document.querySelectorAll('.edit-btn').forEach(btn => {
                btn.addEventListener('click', () => editAppointment(btn.dataset.id));
            });

            document.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    if (confirm('Tem certeza que deseja excluir este agendamento?')) {
                        deleteAppointment(btn.dataset.id);
                    }
                });
            });

        } catch (error) {
            console.error('Erro ao carregar agendamentos:', error);
            showMessage(`Erro: ${error.message}`, true);
        }
    }
    
    // Função auxiliar para formatar data
    function formatDate(dateString) {
        const options = { 
            year: 'numeric', 
            month: '2-digit', 
            day: '2-digit',
            hour: '2-digit', 
            minute: '2-digit' 
        };
        return new Date(dateString).toLocaleDateString('pt-BR', options);
    }

    /**
     * Carrega um agendamento para edição
     * @param {string} id - ID do agendamento
     */
    async function editAppointment(id) {
        try {
            const appointment = await makeRequest(`/pets/${id}`, 'GET', null, true);
            
            document.getElementById('petId').value = appointment.id;
            document.getElementById('petName').value = appointment.pet_name;
            document.getElementById('breed').value = appointment.breed;
            document.getElementById('appointmentDate').value = new Date(appointment.appointment_date).toISOString().slice(0, 16);
            document.getElementById('observations').value = appointment.observations || '';
            
            const preview = document.getElementById('imagePreview');
            preview.innerHTML = appointment.image_path 
                ? `<img src="${API_BASE_URL.replace('/api', '')}/${appointment.image_path}" alt="Preview" class="image-preview">`
                : '<div class="no-image">Sem imagem</div>';
            
            document.getElementById('formTitle').textContent = 'Editar Agendamento';
            modal.style.display = 'block';
        } catch (error) {
            showMessage(`Erro ao carregar agendamento: ${error.message}`, true);
        }
    }

    /**
     * Exclui um agendamento
     * @param {string} id - ID do agendamento
     */
    async function deleteAppointment(id) {
        try {
            showMessage('Excluindo agendamento...');
            await makeRequest(`/pets/${id}`, 'DELETE', null, true);
            showMessage('Agendamento excluído com sucesso!');
            loadAppointments();
        } catch (error) {
            showMessage(`Erro ao excluir agendamento: ${error.message}`, true);
        }
    }

    // Carrega os agendamentos ao iniciar
    loadAppointments();

    // Manipulador do formulário
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            const petName = document.getElementById('petName').value;
            const breed = document.getElementById('breed').value;
            const appointmentDate = document.getElementById('appointmentDate').value;
            
            // Validações básicas
            if (!petName || !breed || !appointmentDate) {
                throw new Error('Por favor, preencha todos os campos obrigatórios');
            }

            if (new Date(appointmentDate) < new Date()) {
                throw new Error('A data do agendamento não pode ser no passado');
            }

            showMessage('Salvando agendamento...');
            
            const formData = new FormData();
            formData.append('pet_name', petName);
            formData.append('breed', breed);
            formData.append('appointment_date', appointmentDate);
            formData.append('observations', document.getElementById('observations').value);
            
            const imageInput = document.getElementById('petImage');
            if (imageInput.files[0]) {
                formData.append('image', imageInput.files[0]);
            }
    
            const id = document.getElementById('petId').value;
            const method = id ? 'PUT' : 'POST';
            const url = id ? `/pets/${id}` : '/pets';
    
            const headers = {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            };
    
            const response = await fetch(`${API_BASE_URL}${url}`, {
                method,
                headers,
                body: formData
            });
    
            if (!response.ok) throw new Error(await response.text());
            
            showMessage('Agendamento salvo com sucesso!');
            modal.style.display = 'none';
            loadAppointments();
        } catch (error) {
            showMessage(`Erro ao salvar: ${error.message}`, true);
        }
    });
}