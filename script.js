class NumberGame {
    constructor(length = 5) {
        this.length = length;
        this.secretNumbers = [];
        this.attempts = 0;
        this.maxAttempts = 10;
        this.gameOver = false;
        this.gameStarted = false;
    }

    generateSecretNumbers() {
        this.secretNumbers = [];
        for (let i = 0; i < this.length; i++) {
            this.secretNumbers.push(Math.floor(Math.random() * 10));
        }
    }

    checkGuess(guess) {
        let correctPosition = 0;
        let correctNumberWrongPosition = 0;

        const secretUsed = new Array(this.length).fill(false);
        const guessUsed = new Array(this.length).fill(false);

        // Kiểm tra số đúng vị trí
        for (let i = 0; i < this.length; i++) {
            if (guess[i] === this.secretNumbers[i]) {
                correctPosition++;
                secretUsed[i] = true;
                guessUsed[i] = true;
            }
        }

        // Kiểm tra số đúng nhưng sai vị trí
        for (let i = 0; i < this.length; i++) {
            if (!guessUsed[i]) {
                for (let j = 0; j < this.length; j++) {
                    if (!secretUsed[j] && guess[i] === this.secretNumbers[j]) {
                        correctNumberWrongPosition++;
                        secretUsed[j] = true;
                        break;
                    }
                }
            }
        }

        return {
            correctPosition,
            correctNumberWrongPosition,
            isWin: correctPosition === this.length
        };
    }

    startNewGame() {
        this.generateSecretNumbers();
        this.attempts = 0;
        this.gameOver = false;
        this.gameStarted = true;
    }
}

// Khởi tạo game
const game = new NumberGame(5);
const elements = {
    startBtn: document.getElementById('startBtn'),
    resetBtn: document.getElementById('resetBtn'),
    submitGuess: document.getElementById('submitGuess'),
    inputSection: document.getElementById('inputSection'),
    attempts: document.getElementById('attempts'),
    gameStatus: document.getElementById('gameStatus'),
    resultsContainer: document.getElementById('resultsContainer'),
    secretDisplay: document.getElementById('secretDisplay'),
    secretNumbers: document.getElementById('secretNumbers'),
    numberInputs: document.querySelectorAll('.number-input')
};

// Sự kiện bắt đầu game
elements.startBtn.addEventListener('click', startGame);
elements.resetBtn.addEventListener('click', resetGame);
elements.submitGuess.addEventListener('click', submitGuess);

// Cho phép nhập Enter để submit
elements.numberInputs.forEach((input, index) => {
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            submitGuess();
        }
        
        // Tự động chuyển sang ô tiếp theo
        if (e.target.value.length === 1 && index < elements.numberInputs.length - 1) {
            elements.numberInputs[index + 1].focus();
        }
    });
});

function startGame() {
    game.startNewGame();
    elements.inputSection.style.display = 'block';
    elements.startBtn.disabled = true;
    elements.resetBtn.disabled = false;
    elements.submitGuess.disabled = false;
    elements.resultsContainer.innerHTML = '';
    elements.secretDisplay.style.display = 'none';
    elements.attempts.textContent = '0';
    elements.gameStatus.textContent = 'Đang chơi';
    
    // Focus vào ô đầu tiên
    elements.numberInputs[0].focus();
    
    updateUI();
}

function resetGame() {
    startGame();
}

function submitGuess() {
    if (game.gameOver) return;

    const guess = [];
    let isValid = true;

    // Lấy và validate dữ liệu nhập
    elements.numberInputs.forEach(input => {
        const value = parseInt(input.value);
        if (isNaN(value) || value < 0 || value > 9) {
            isValid = false;
            input.style.borderColor = '#dc3545';
        } else {
            guess.push(value);
            input.style.borderColor = '#ddd';
        }
    });

    if (!isValid) {
        alert('Vui lòng nhập đầy đủ 5 số từ 0-9!');
        return;
    }

    // Kiểm tra dự đoán
    const result = game.checkGuess(guess);
    game.attempts++;

    // Hiển thị kết quả
    displayGuessResult(guess, result);

    // Cập nhật UI
    updateUI();

    // Xóa input
    elements.numberInputs.forEach(input => {
        input.value = '';
    });
    elements.numberInputs[0].focus();

    // Kiểm tra kết thúc game
    if (result.isWin || game.attempts >= game.maxAttempts) {
        endGame(result.isWin);
    }
}

function displayGuessResult(guess, result) {
    const guessElement = document.createElement('div');
    guessElement.className = 'guess-result';
    
    guessElement.innerHTML = `
        <div class="guess-numbers">
            ${guess.map(num => `<div class="guess-number">${num}</div>`).join('')}
        </div>
        <div class="guess-feedback">
            <div class="feedback-item correct-position">
                ✅ ${result.correctPosition}
            </div>
            <div class="feedback-item correct-number">
                🔄 ${result.correctNumberWrongPosition}
            </div>
        </div>
    `;

    elements.resultsContainer.prepend(guessElement);
}

function updateUI() {
    elements.attempts.textContent = game.attempts;
    
    if (game.attempts >= game.maxAttempts - 2 && !game.gameOver) {
        elements.gameStatus.textContent = `Cẩn thận! Còn ${game.maxAttempts - game.attempts} lượt`;
        elements.gameStatus.style.color = '#dc3545';
    } else {
        elements.gameStatus.style.color = '#333';
    }
}

function endGame(isWin) {
    game.gameOver = true;
    elements.submitGuess.disabled = true;
    elements.gameStatus.textContent = isWin ? 'Chiến thắng! 🎉' : 'Thua cuộc! 💀';
    elements.gameStatus.style.color = isWin ? '#28a745' : '#dc3545';

    // Hiển thị số bí mật
    elements.secretNumbers.innerHTML = game.secretNumbers.map(num => 
        `<div class="secret-number">${num}</div>`
    ).join('');
    elements.secretDisplay.style.display = 'block';

    // Hiệu ứng chiến thắng/thua
    const message = isWin ? 
        `Chúc mừng! Bạn đã chiến thắng sau ${game.attempts} lượt!` :
        `Hết lượt rồi! Hãy thử lại lần sau!`;
    
    setTimeout(() => alert(message), 500);
}

// Khởi tạo ban đầu
elements.resetBtn.disabled = true;
elements.submitGuess.disabled = true;