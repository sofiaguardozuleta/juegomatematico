document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const hero = document.getElementById('hero');
    const levelDisplay = document.getElementById('level');
    const scoreDisplay = document.getElementById('score');
    const heartsDisplay = document.querySelector('.hearts span');
    const questionText = document.getElementById('question-text');
    const answerButtons = [
        document.getElementById('answer1'),
        document.getElementById('answer2'),
        document.getElementById('answer3'),
        document.getElementById('answer4')
    ];
    const powerupButtons = [
        document.getElementById('powerup1'),
        document.getElementById('powerup2'),
        document.getElementById('powerup3')
    ];
    const startBtn = document.getElementById('start-btn');
    const continueBtn = document.getElementById('continue-btn');
    const timerBar = document.getElementById('timer');
    const levelProgress = document.getElementById('level-progress');
    const gameModal = document.getElementById('game-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalMessage = document.getElementById('modal-message');
    
    // Sonidos
    const correctSound = document.getElementById('correct-sound');
    const wrongSound = document.getElementById('wrong-sound');
    const levelupSound = document.getElementById('levelup-sound');
    
    // Variables del juego
    let currentLevel = 1;
    let score = 0;
    let lives = 3;
    let timer;
    let timeLeft = 15;
    let questionsAnswered = 0;
    let currentQuestion = {};
    let powerups = {
        doublePoints: 1,
        extraTime: 1,
        hint: 1
    };
    
    // Operaciones matemáticas
    const operations = ['+', '-', '*', '/'];
    
    // Iniciar juego
    startBtn.addEventListener('click', startGame);
    continueBtn.addEventListener('click', nextLevel);
    
    // Configurar botones de respuesta
    answerButtons.forEach(button => {
        button.addEventListener('click', function() {
            checkAnswer(parseInt(this.textContent));
        });
    });
    
    // Configurar power-ups
    powerupButtons[0].addEventListener('click', useDoublePoints);
    powerupButtons[1].addEventListener('click', useExtraTime);
    powerupButtons[2].addEventListener('click', useHint);
    
    function startGame() {
        currentLevel = 1;
        score = 0;
        lives = 3;
        questionsAnswered = 0;
        
        // Resetear power-ups
        powerups = {
            doublePoints: 1,
            extraTime: 1,
            hint: 1
        };
        
        // Actualizar UI
        updateUI();
        startBtn.classList.add('hidden');
        
        // Posicionar personaje
        hero.style.left = '0%';
        levelProgress.style.width = '0%';
        
        // Generar primera pregunta
        generateQuestion();
        startTimer();
    }
    
    function generateQuestion() {
        // Determinar dificultad según nivel
        let maxNumber = 10 + (currentLevel * 5);
        if (maxNumber > 50) maxNumber = 50;
        
        // Seleccionar operación aleatoria
        const operation = operations[Math.floor(Math.random() * operations.length)];
        
        let num1, num2, answer;
        
        // Generar números según la operación
        switch(operation) {
            case '+':
                num1 = Math.floor(Math.random() * maxNumber) + 1;
                num2 = Math.floor(Math.random() * maxNumber) + 1;
                answer = num1 + num2;
                break;
            case '-':
                num1 = Math.floor(Math.random() * maxNumber) + 10;
                num2 = Math.floor(Math.random() * num1) + 1;
                answer = num1 - num2;
                break;
            case '*':
                num1 = Math.floor(Math.random() * (maxNumber/2)) + 1;
                num2 = Math.floor(Math.random() * (maxNumber/2)) + 1;
                answer = num1 * num2;
                break;
            case '/':
                answer = Math.floor(Math.random() * (maxNumber/2)) + 1;
                num2 = Math.floor(Math.random() * (maxNumber/2)) + 1;
                num1 = answer * num2;
                break;
        }
        
        // Guardar pregunta actual
        currentQuestion = {
            num1: num1,
            num2: num2,
            operation: operation,
            answer: answer,
            options: generateOptions(answer, maxNumber)
        };
        
        // Mostrar pregunta
        displayQuestion();
    }
    
    function generateOptions(correctAnswer, maxNumber) {
        const options = [correctAnswer];
        
        // Generar 3 opciones incorrectas
        while (options.length < 4) {
            let randomOption;
            const variation = Math.floor(maxNumber / 3) + 1;
            
            // Crear opciones cercanas a la respuesta correcta
            if (Math.random() > 0.5) {
                randomOption = correctAnswer + Math.floor(Math.random() * variation) + 1;
            } else {
                randomOption = correctAnswer - Math.floor(Math.random() * variation) - 1;
            }
            
            // Asegurar que no sea negativo y no se repita
            if (randomOption > 0 && !options.includes(randomOption)) {
                options.push(randomOption);
            }
        }
        
        // Mezclar opciones
        return shuffleArray(options);
    }
    
    function displayQuestion() {
        // Mostrar texto de la pregunta
        let operatorSymbol;
        switch(currentQuestion.operation) {
            case '+': operatorSymbol = '+'; break;
            case '-': operatorSymbol = '-'; break;
            case '*': operatorSymbol = '×'; break;
            case '/': operatorSymbol = '÷'; break;
        }
        
        questionText.textContent = `${currentQuestion.num1} ${operatorSymbol} ${currentQuestion.num2} = ?`;
        
        // Mostrar opciones de respuesta
        answerButtons.forEach((button, index) => {
            button.textContent = currentQuestion.options[index];
            button.classList.remove('correct-answer', 'wrong-answer');
            button.disabled = false;
        });
        
        // Resetear timer
        resetTimer();
    }
    
    function checkAnswer(selectedAnswer) {
        clearInterval(timer);
        
        // Deshabilitar botones
        answerButtons.forEach(button => {
            button.disabled = true;
        });
        
        // Verificar respuesta
        if (selectedAnswer === currentQuestion.answer) {
            // Respuesta correcta
            answerButtons.forEach(button => {
                if (parseInt(button.textContent) === currentQuestion.answer) {
                    button.classList.add('correct-answer');
                }
            });
            
            // Reproducir sonido
            if (correctSound) correctSound.play();
            
            // Calcular puntos (más puntos en niveles más altos)
            let pointsEarned = 10 * currentLevel;
            
            // Aplicar power-up de doble puntos
            if (powerups.doublePoints > 0) {
                pointsEarned *= 2;
                modalMessage.textContent = `¡Doble puntos activado! Ganaste ${pointsEarned} puntos`;
                showModal('¡Correcto!');
            } else {
                modalMessage.textContent = `+${pointsEarned} puntos`;
                showModal('¡Correcto!');
            }
            
            score += pointsEarned;
            questionsAnswered++;
            
            // Mover personaje
            const progressPercent = Math.min(questionsAnswered * (100 / (5 + currentLevel)), 100);
            levelProgress.style.width = `${progressPercent}%`;
            hero.style.left = `${progressPercent}%`;
            
            // Verificar si se completó el nivel
            if (questionsAnswered >= 5 + currentLevel) {
                clearInterval(timer);
                setTimeout(completeLevel, 1500);
            } else {
                setTimeout(generateQuestion, 1500);
            }
        } else {
            // Respuesta incorrecta
            answerButtons.forEach(button => {
                if (parseInt(button.textContent) === selectedAnswer) {
                    button.classList.add('wrong-answer');
                }
                if (parseInt(button.textContent) === currentQuestion.answer) {
                    button.classList.add('correct-answer');
                }
            });
            
            // Reproducir sonido
            if (wrongSound) wrongSound.play();
            
            // Perder vida
            lives--;
            updateUI();
            
            if (lives <= 0) {
                gameOver();
            } else {
                modalMessage.textContent = `La respuesta correcta era ${currentQuestion.answer}`;
                showModal('¡Incorrecto!');
                setTimeout(generateQuestion, 1500);
            }
        }
        
        updateUI();
    }
    
    function startTimer() {
        resetTimer();
        timer = setInterval(updateTimer, 1000);
    }
    
    function resetTimer() {
        clearInterval(timer);
        timeLeft = 15;
        timerBar.style.width = '100%';
        startTimer();
    }
    
    function updateTimer() {
        timeLeft--;
        timerBar.style.width = `${(timeLeft / 15) * 100}%`;
        
        if (timeLeft <= 0) {
            clearInterval(timer);
            timeUp();
        }
    }
    
    function timeUp() {
        lives--;
        updateUI();
        
        if (lives <= 0) {
            gameOver();
        } else {
            modalMessage.textContent = `¡Se acabó el tiempo! La respuesta era ${currentQuestion.answer}`;
            showModal('¡Tiempo agotado!');
            setTimeout(generateQuestion, 1500);
        }
    }
    
    function completeLevel() {
        currentLevel++;
        questionsAnswered = 0;
        
        // Reproducir sonido de subida de nivel
        if (levelupSound) levelupSound.play();
        
        // Recompensas por completar nivel
        score += 50 * currentLevel;
        powerups.doublePoints = 1;
        powerups.extraTime = 1;
        powerups.hint = 1;
        
        // Mostrar modal de nivel completado
        modalTitle.textContent = `¡Nivel ${currentLevel - 1} completado!`;
        modalMessage.textContent = `¡Felicidades! Avanzas al nivel ${currentLevel}`;
        showModal();
        
        updateUI();
    }
    
    function nextLevel() {
        hideModal();
        levelProgress.style.width = '0%';
        hero.style.left = '0%';
        generateQuestion();
    }
    
    function gameOver() {
        modalTitle.textContent = '¡Juego terminado!';
        modalMessage.textContent = `Puntuación final: ${score} puntos\nNivel alcanzado: ${currentLevel}`;
        continueBtn.textContent = 'Jugar de nuevo';
        continueBtn.onclick = startGame;
        showModal();
    }
    
    function updateUI() {
        levelDisplay.textContent = currentLevel;
        scoreDisplay.textContent = score;
        
        // Actualizar corazones
        let hearts = '';
        for (let i = 0; i < 3; i++) {
            hearts += i < lives ? '❤️ ' : '♡ ';
        }
        heartsDisplay.innerHTML = hearts;
        
        // Actualizar power-ups
        powerupButtons[0].textContent = `🎲 x2 Puntos (${powerups.doublePoints})`;
        powerupButtons[1].textContent = `⏱️ +10s (${powerups.extraTime})`;
        powerupButtons[2].textContent = `💡 Ayuda (${powerups.hint})`;
    }
    
    function showModal(title = '', message = '') {
        if (title) modalTitle.textContent = title;
        if (message) modalMessage.textContent = message;
        gameModal.classList.remove('hidden');
    }
    
    function hideModal() {
        gameModal.classList.add('hidden');
    }
    
    // Power-ups
    function useDoublePoints() {
        if (powerups.doublePoints > 0) {
            powerups.doublePoints--;
            updateUI();
            modalTitle.textContent = 'Power-up activado';
            modalMessage.textContent = '¡Tus próximos puntos se duplicarán!';
            showModal();
            setTimeout(hideModal, 1500);
        }
    }
    
    function useExtraTime() {
        if (powerups.extraTime > 0) {
            powerups.extraTime--;
            timeLeft += 10;
            if (timeLeft > 15) timeLeft = 15;
            timerBar.style.width = `${(timeLeft / 15) * 100}%`;
            updateUI();
            modalTitle.textContent = 'Power-up activado';
            modalMessage.textContent = '¡+10 segundos añadidos!';
            showModal();
            setTimeout(hideModal, 1500);
        }
    }
    
    function useHint() {
        if (powerups.hint > 0) {
            powerups.hint--;
            updateUI();
            
            // Eliminar dos respuestas incorrectas
            let wrongAnswers = answerButtons.filter(btn => 
                parseInt(btn.textContent) !== currentQuestion.answer
            );
            
            // Mezclar y seleccionar 2 incorrectas para eliminar
            wrongAnswers = shuffleArray(wrongAnswers);
            wrongAnswers.slice(0, 2).forEach(btn => {
                btn.textContent = 'X';
                btn.disabled = true;
            });
            
            modalTitle.textContent = 'Power-up activado';
            modalMessage.textContent = '¡Se han eliminado 2 respuestas incorrectas!';
            showModal();
            setTimeout(hideModal, 1500);
        }
    }
    
    // Funciones auxiliares
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
});