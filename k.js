
document.addEventListener('DOMContentLoaded', function() {
    // Variables d'état
    let currentUser = null;
    let currentExam = null;
    let currentQuestions = [];

    // Initialisation
    initAuthSystem();
    checkUrlForExam();

    // Système d'authentification
    function initAuthSystem() {
        // Charger les utilisateurs si existants
        if (!localStorage.getItem('users')) {
            localStorage.setItem('users', JSON.stringify([]));
        }

        // Basculer entre login/register
        document.getElementById('toggle-register').addEventListener('click', function() {
            document.getElementById('login-form').style.display = 'none';
            document.getElementById('register-form').style.display = 'block';
        });

        document.getElementById('toggle-login').addEventListener('click', function() {
            document.getElementById('register-form').style.display = 'none';
            document.getElementById('login-form').style.display = 'block';
        });

        // Login
        document.getElementById('login-btn').addEventListener('click', loginUser);

        // Register
        document.getElementById('register-btn').addEventListener('click', registerUser);

        // Logout
        document.getElementById('logout-btn').addEventListener('click', logout);
        document.getElementById('student-logout-btn').addEventListener('click', logout);
    }

    function loginUser() {
        const role = document.getElementById('login-role').value;
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value.trim();

        const users = JSON.parse(localStorage.getItem('users'));
        const user = users.find(u => u.email === email && u.role === role);

        if (user && user.password === password) {
            currentUser = user;
            showUserDashboard();
        } else {
            alert('Identifiants incorrects');
        }
    }

    function registerUser() {
        const role = document.getElementById('register-role').value;
        const name = document.getElementById('register-name').value.trim();
        const email = document.getElementById('register-email').value.trim();
        const password = document.getElementById('register-password').value.trim();

        if (!name || !email || !password) {
            alert('Veuillez remplir tous les champs');
            return;
        }

        const users = JSON.parse(localStorage.getItem('users'));
        
        if (users.some(u => u.email === email)) {
            alert('Cet email est déjà utilisé');
            return;
        }

        const newUser = {
            id: Date.now().toString(),
            name,
            email,
            password,
            role
        };

        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        
        currentUser = newUser;
        showUserDashboard();
    }

    function logout() {
        currentUser = null;
        document.getElementById('app').querySelectorAll('.screen').forEach(screen => {
            screen.style.display = 'none';
        });
        document.getElementById('home').style.display = 'block';
        document.getElementById('login-form').style.display = 'block';
        document.getElementById('register-form').style.display = 'none';
        window.history.replaceState({}, document.title, window.location.pathname);
    }

    function showUserDashboard() {
        document.getElementById('home').style.display = 'none';
        
        if (currentUser.role === 'teacher') {
            document.getElementById('teacher').style.display = 'block';
            initTeacherSpace();
        } else {
            document.getElementById('student').style.display = 'block';
            initStudentSpace();
        }
    }

    // Espace Enseignant
    function initTeacherSpace() {
        document.getElementById('teacher-dashboard').style.display = 'block';
        document.getElementById('exam-creation').style.display = 'none';
        document.getElementById('question-management').style.display = 'none';

        // Charger les examens existants
        if (!localStorage.getItem('exams')) {
            localStorage.setItem('exams', JSON.stringify([]));
        }

        // Boutons dashboard
        document.getElementById('create-exam-btn').addEventListener('click', function() {
            document.getElementById('teacher-dashboard').style.display = 'none';
            document.getElementById('exam-creation').style.display = 'block';
        });

        document.getElementById('view-exams-btn').addEventListener('click', function() {
            // À implémenter: liste des examens existants
        });

        // Création d'examen
        document.getElementById('save-exam-btn').addEventListener('click', function() {
            const title = document.getElementById('exam-title').value.trim();
            const description = document.getElementById('exam-description').value.trim();
            const audience = document.getElementById('exam-audience').value.trim();

            if (!title || !description || !audience) {
                alert('Veuillez remplir tous les champs');
                return;
            }

            currentExam = {
                id: Date.now().toString(),
                title,
                description,
                audience,
                teacherId: currentUser.id,
                createdAt: new Date().toISOString(),
                questions: []
            };

            // Sauvegarder l'examen
            const exams = JSON.parse(localStorage.getItem('exams'));
            exams.push(currentExam);
            localStorage.setItem('exams', JSON.stringify(exams));

            // Passer à la gestion des questions
            document.getElementById('exam-creation').style.display = 'none';
            document.getElementById('question-management').style.display = 'block';
            document.getElementById('current-exam-name').textContent = title;
            
            initQuestionManagement();
        });
    }

    function initQuestionManagement() {
        // Afficher les formulaires de questions
        document.getElementById('add-direct-btn').addEventListener('click', function() {
            document.getElementById('direct-form').style.display = 'block';
            document.getElementById('qcm-form').style.display = 'none';
        });

        document.getElementById('add-qcm-btn').addEventListener('click', function() {
            document.getElementById('qcm-form').style.display = 'block';
            document.getElementById('direct-form').style.display = 'none';
        });

        // Ajout d'options QCM
        document.getElementById('add-option-btn').addEventListener('click', function() {
            const optionsContainer = document.getElementById('qcm-options');
            const optionCount = optionsContainer.children.length + 1;
            
            const optionDiv = document.createElement('div');
            optionDiv.className = 'qcm-option';
            optionDiv.innerHTML = `
                <input type="text" class="option-text" placeholder="Option ${optionCount}">
                <input type="checkbox" class="option-correct">
                <label>Correcte</label>
            `;
            
            optionsContainer.appendChild(optionDiv);
        });

        // Sauvegarde question directe
        document.getElementById('save-direct-btn').addEventListener('click', function() {
            const text = document.getElementById('direct-text').value.trim();
            const answer = document.getElementById('direct-answer').value.trim();
            const tolerance = parseInt(document.getElementById('direct-tolerance').value);
            const points = parseInt(document.getElementById('direct-points').value);
            const duration = parseInt(document.getElementById('direct-duration').value);

            if (!text || !answer) {
                alert('Veuillez remplir tous les champs');
                return;
            }

            const question = {
                id: Date.now().toString(),
                type: 'direct',
                text,
                answer,
                tolerance,
                points,
                duration
            };

            addQuestionToExam(question);
            document.getElementById('direct-form').style.display = 'none';
        });

        // Sauvegarde QCM
        document.getElementById('save-qcm-btn').addEventListener('click', function() {
            const text = document.getElementById('qcm-text').value.trim();
            const options = Array.from(document.querySelectorAll('.option-text'))
                .map(input => input.value.trim())
                .filter(val => val);
            
            const correctOptions = Array.from(document.querySelectorAll('.option-correct'))
                .map((checkbox, index) => checkbox.checked ? index : null)
                .filter(val => val !== null);

            const points = parseInt(document.getElementById('qcm-points').value);
            const duration = parseInt(document.getElementById('qcm-duration').value);

            if (!text || options.length < 2 || correctOptions.length === 0) {
                alert('Veuillez fournir au moins 2 options et sélectionner une réponse correcte');
                return;
            }

            const question = {
                id: Date.now().toString(),
                type: 'qcm',
                text,
                options,
                correctOptions,
                points,
                duration
            };

            addQuestionToExam(question);
            document.getElementById('qcm-form').style.display = 'none';
        });

        // Afficher le lien quand 10 questions sont ajoutées
        function checkQuestionCount() {
            if (currentExam.questions.length >= 10) { // 5 QCM + 5 Directes
                document.getElementById('exam-link-container').style.display = 'block';
                document.getElementById('exam-link').value = `${window.location.origin}${window.location.pathname}?examId=${currentExam.id}`;
                
                document.getElementById('copy-link-btn').addEventListener('click', function() {
                    const linkInput = document.getElementById('exam-link');
                    linkInput.select();
                    document.execCommand('copy');
                    alert('Lien copié!');
                });
            }
        }

        function addQuestionToExam(question) {
            currentExam.questions.push(question);
            
            // Mettre à jour le localStorage
            const exams = JSON.parse(localStorage.getItem('exams'));
            const examIndex = exams.findIndex(e => e.id === currentExam.id);
            exams[examIndex] = currentExam;
            localStorage.setItem('exams', JSON.stringify(exams));
            
            renderQuestions();
            checkQuestionCount();
        }

        function renderQuestions() {
            const container = document.getElementById('questions-container');
            container.innerHTML = '';
            
            currentExam.questions.forEach((q, index) => {
                const questionDiv = document.createElement('div');
                questionDiv.className = 'question-item';
                
                if (q.type === 'direct') {
                    questionDiv.innerHTML = `
                        <h4>Question ${index + 1}: ${q.text}</h4>
                        <p class="question-meta">Type: Directe | Points: ${q.points} | Durée: ${q.duration}s</p>
                        <p>Réponse: ${q.answer} (Tolérance: ${q.tolerance}%)</p>
                    `;
                } else {
                    questionDiv.innerHTML = `
                        <h4>Question ${index + 1}: ${q.text}</h4>
                        <p class="question-meta">Type: QCM | Points: ${q.points} | Durée: ${q.duration}s</p>
                        <p>Options: ${q.options.join(', ')}</p>
                        <p>Réponses correctes: ${q.correctOptions.map(i => q.options[i]).join(', ')}</p>
                    `;
                }
                
                container.appendChild(questionDiv);
            });
        }
    }

    // Espace Étudiant
    function initStudentSpace() {
        // Vérifier si un examen est spécifié dans l'URL
        checkUrlForExam();
    }

    function checkUrlForExam() {
        const urlParams = new URLSearchParams(window.location.search);
        const examId = urlParams.get('examId');
        
        if (examId && currentUser?.role === 'student') {
            startExam(examId);
        }
    }

    function startExam(examId) {
        const exams = JSON.parse(localStorage.getItem('exams')) || [];
        const exam = exams.find(e => e.id === examId);
        
        if (!exam) {
            alert('Examen non trouvé');
            return;
        }

        // Afficher l'interface d'examen
        const container = document.getElementById('student-exam-container');
        container.innerHTML = `
            <h3>${exam.title}</h3>
            <p>${exam.description}</p>
            <p>Public: ${exam.audience}</p>
            <button id="start-exam-btn">Commencer l'examen</button>
        `;

        document.getElementById('start-exam-btn').addEventListener('click', function() {
            // Demander la géolocalisation
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    position => {
                        // Enregistrer la position (simplifié)
                        console.log('Position:', position.coords);
                        displayQuestions(exam);
                    },
                    error => {
                        alert('La géolocalisation est requise pour cet examen');
                        console.error(error);
                    }
                );
            } else {
                alert('Géolocalisation non supportée par votre navigateur');
            }
        });
    }

    function displayQuestions(exam) {
        function displayQuestions(exam) {
    let currentQuestionIndex = 0;
    let score = 0;
    let studentAnswers = [];
    
    function showQuestion(index) {
        const container = document.getElementById('student-exam-container');
        const question = exam.questions[index];
        
        container.innerHTML = `
            <div class="question-card">
                <h3>Question ${index + 1}/${exam.questions.length}</h3>
                <p class="question-text">${question.text}</p>
                ${question.image ? `<img src="${question.image}" class="question-image">` : ''}
                ${question.type === 'direct' ? `
                    <input type="text" id="student-answer" placeholder="Votre réponse">
                ` : `
                    <div class="qcm-options">
                        ${question.options.map((opt, i) => `
                            <label>
                                <input type="${question.correctOptions.length > 1 ? 'checkbox' : 'radio'}" 
                                       name="qcm-answer" value="${i}">
                                ${opt}
                            </label>
                        `).join('')}
                    </div>
                `}
                
                <div class="timer">Temps restant: <span id="time">${question.duration}</span>s</div>
                <button id="next-question-btn">Suivant</button>
            </div>
        `;

        startTimer(question.duration);
    }

    showQuestion(0);




    document.addEventListener('click', function(e) {
    if (e.target.id === 'next-question-btn') {
        // Enregistrer la réponse
        const question = exam.questions[currentQuestionIndex];
        let answer;
        
        if (question.type === 'direct') {
            answer = document.getElementById('student-answer').value.trim();
            // Vérifier avec tolérance
            if (isAnswerCorrect(answer, question.answer, question.tolerance)) {
                score += question.points;
            }
        } else {
            const selected = Array.from(
                document.querySelectorAll('input[name="qcm-answer"]:checked')
            ).map(el => parseInt(el.value));
            
            // Vérifier si toutes les bonnes réponses sont sélectionnées
            if (arraysEqual(selected, question.correctOptions)) {
                score += question.points;
            }
        }
        
        // Passer à la question suivante ou afficher résultats
        currentQuestionIndex++;
        if (currentQuestionIndex < exam.questions.length) {
            showQuestion(currentQuestionIndex);
        } else {
            showResults();
        }
    }
});

function isAnswerCorrect(studentAnswer, correctAnswer, tolerance) {
    // Vérification avec tolérance aux fautes
    const diff = levenshteinDistance(studentAnswer.toLowerCase(), correctAnswer.toLowerCase());
    const maxLength = Math.max(studentAnswer.length, correctAnswer.length);
    return (diff / maxLength) <= (tolerance / 100);
}

function arraysEqual(a, b) {
    return a.length === b.length && a.every((val, i) => val === b[i]);
}

function showResults() {
    const container = document.getElementById('student-exam-container');
    const totalPoints = exam.questions.reduce((sum, q) => sum + q.points, 0);
    
    container.innerHTML = `
        <div class="results">
            <h2>Résultats</h2>
            <p class="score">Score: ${score}/${totalPoints}</p>
            <p>${Math.round((score/totalPoints)*100)}% de bonnes réponses</p>
            <button id="back-to-home">Retour</button>
        </div>
    `;
}
}
function startTimer(duration) {
    let timeLeft = duration;
    const timerDisplay = document.getElementById('time');
    
    const timer = setInterval(() => {
        timeLeft--;
        timerDisplay.textContent = timeLeft;
        
        if (timeLeft <= 0) {
            clearInterval(timer);
            document.getElementById('next-question-btn').click();
        }
    }, 1000);
}
        // À implémenter: affichage des questions une par une avec timer
        // et calcul du score final
    }
});