class NumberGuessingGame {
    constructor() {
        this.secretNumber = '';
        this.attempts = 0;
        this.gameHistory = [];
        this.isGameOver = false;
        
        this.initializeElements();
        this.bindEvents();
        this.startNewGame();
    }
    
    initializeElements() {
        this.guessInput = document.getElementById('guessInput');
        this.guessBtn = document.getElementById('guessBtn');
        this.newGameBtn = document.getElementById('newGameBtn');
        this.attemptCount = document.getElementById('attemptCount');
        this.correctPosition = document.getElementById('correctPosition');
        this.correctNumber = document.getElementById('correctNumber');
        this.historyList = document.getElementById('historyList');
        this.secretDisplay = document.getElementById('secretDisplay');
        this.victoryModal = document.getElementById('victoryModal');
        this.victoryNumber = document.getElementById('victoryNumber');
        this.victoryAttempts = document.getElementById('victoryAttempts');
        this.playAgainBtn = document.getElementById('playAgainBtn');
        this.closeModal = document.querySelector('.close');
    }
    
    bindEvents() {
        this.guessBtn.addEventListener('click', () => this.makeGuess());
        this.newGameBtn.addEventListener('click', () => this.startNewGame());
        this.playAgainBtn.addEventListener('click', () => this.startNewGame());
        this.closeModal.addEventListener('click', () => this.closeVictoryModal());
        
        this.guessInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.makeGuess();
            }
        });
        
        this.guessInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/[^0-9]/g, '');
        });
        
        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === this.victoryModal) {
                this.closeVictoryModal();
            }
        });
    }
    
    generateSecretNumber() {
        let secret = '';
        for (let i = 0; i < 5; i++) {
            secret += Math.floor(Math.random() * 10).toString();
        }
        return secret;
    }
    
    startNewGame() {
        this.secretNumber = this.generateSecretNumber();
        this.attempts = 0;
        this.gameHistory = [];
        this.isGameOver = false;
        
        this.updateDisplay();
        this.clearHistory();
        this.closeVictoryModal();
        this.guessInput.value = '';
        this.guessInput.focus();
        
        console.log('Secret number (for testing):', this.secretNumber);
    }
    
    makeGuess() {
        if (this.isGameOver) return;
        
        const guess = this.guessInput.value.trim();
        
        if (!this.isValidGuess(guess)) {
            alert('Vui lòng nhập đúng 5 chữ số (0-9)!');
            return;
        }
        
        this.attempts++;
        const result = this.checkGuess(guess);
        this.gameHistory.push({ guess, ...result });
        
        this.updateDisplay();
        this.addToHistory(guess, result);
        
        if (result.correctPosition === 5) {
            this.showVictory();
        }
        
        this.guessInput.value = '';
    }
    
    isValidGuess(guess) {
        return /^\d{5}$/.test(guess);
    }
    
    checkGuess(guess) {
        let correctPosition = 0;
        let correctNumber = 0;
        
        const secretCount = new Array(10).fill(0);
        const guessCount = new Array(10).fill(0);
        
        // Count correct positions and prepare for number counting
        for (let i = 0; i < 5; i++) {
            if (guess[i] === this.secretNumber[i]) {
                correctPosition++;
            } else {
                secretCount[parseInt(this.secretNumber[i])]++;
                guessCount[parseInt(guess[i])]++;
            }
        }
        
        // Count correct numbers in wrong positions
        for (let i = 0; i < 10; i++) {
            correctNumber += Math.min(secretCount[i], guessCount[i]);
        }
        
        return { correctPosition, correctNumber };
    }
    
    updateDisplay() {
        this.attemptCount.textContent = this.attempts;
        
        if (this.gameHistory.length > 0) {
            const lastResult = this.gameHistory[this.gameHistory.length - 1];
            this.correctPosition.textContent = lastResult.correctPosition;
            this.correctNumber.textContent = lastResult.correctNumber;
        } else {
            this.correctPosition.textContent = '0';
            this.correctNumber.textContent = '0';
        }
    }
    
    addToHistory(guess, result) {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        historyItem.innerHTML = `
            <div class="history-number">${guess}</div>
            <div class="history-feedback">
                <span class="correct-pos">✓ ${result.correctPosition}</span>
                <span class="wrong-pos">↷ ${result.correctNumber}</span>
            </div>
        `;
        
        this.historyList.prepend(historyItem);
    }
    
    clearHistory() {
        this.historyList.innerHTML = '';
    }
    
    showVictory() {
        this.isGameOver = true;
        this.victoryNumber.textContent = this.secretNumber;
        this.victoryAttempts.textContent = this.attempts;
        this.victoryModal.style.display = 'block';
        
        // Reveal secret number in display
        const spans = this.secretDisplay.querySelectorAll('span');
        spans.forEach((span, index) => {
            span.textContent = this.secretNumber[index];
            span.style.background = '#28a745';
        });
    }
    
    closeVictoryModal() {
        this.victoryModal.style.display = 'none';
    }
}

// Initialize the game when page loads
document.addEventListener('DOMContentLoaded', () => {
    new NumberGuessingGame();
});