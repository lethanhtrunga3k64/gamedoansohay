class NumberGuessingGame {
  constructor() {
    this.config = {
      easy: { length: 5, maxAttempts: 10, multiplier: 1 },
      normal: { length: 6, maxAttempts: 12, multiplier: 2 },
      hard: { length: 7, maxAttempts: 15, multiplier: 3 }
    };
    
    this.currentMode = 'easy';
    this.secretNumber = [];
    this.attempts = 0;
    this.history = [];
    this.score = 0;
    this.highScore = this.loadHighScore();
    this.hintsLeft = 3;
    this.startTime = null;
    this.timerInterval = null;
    this.gameActive = false;
    
    this.init();
  }
  
  init() {
    this.setupEventListeners();
    this.updateLeaderboard();
    this.updateStats();
    this.startNewGame();
  }
  
  setupEventListeners() {
    // Mode selection
    document.querySelectorAll('.mode-btn').forEach(btn => {
      btn.addEventListener('click', (e) => this.changeMode(e.target.closest('.mode-btn')));
    });
    
    // Form submission
    document.getElementById('guessForm').addEventListener('submit', (e) => this.handleGuess(e));
    
    // Buttons
    document.getElementById('hintBtn').addEventListener('click', () => this.giveHint());
    document.getElementById('restartBtn').addEventListener('click', () => this.startNewGame());
    document.getElementById('playAgainBtn').addEventListener('click', () => this.startNewGame());
    
    // Leaderboard tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => this.changeLeaderboardTab(e.target));
    });
    
    // Auto-focus on input change
    document.addEventListener('input', (e) => {
      if (e.target.classList.contains('guess-input')) {
        this.handleInputNavigation(e.target);
      }
    });
  }
  
  changeMode(modeButton) {
    // Update active mode
    document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
    modeButton.classList.add('active');
    
    // Update current mode
    this.currentMode = modeButton.dataset.mode;
    
    // Update UI
    document.getElementById('level').textContent = 
      this.currentMode === 'easy' ? 'Dễ' : 
      this.currentMode === 'normal' ? 'Thường' : 'Khó';
    
    // Start new game with selected mode
    this.startNewGame();
  }
  
  startNewGame() {
    this.gameActive = true;
    this.attempts = 0;
    this.history = [];
    this.hintsLeft = 3;
    this.secretNumber = this.generateSecretNumber();
    
    // Clear UI
    document.getElementById('history').innerHTML = '';
    document.getElementById('endMessage').innerHTML = '';
    document.getElementById('endMessage').className = 'end-message';
    document.getElementById('playAgain').style.display = 'none';
    document.getElementById('error').textContent = '';
    document.getElementById('guessForm').style.display = '';
    
    // Update UI
    this.updateInputs();
    this.updateAttemptInfo();
    this.updateHintButton();
    this.updateStats();
    
    // Start timer
    this.startTimer();
    
    // Focus first input
    setTimeout(() => {
      const firstInput = document.querySelector('.guess-input');
      if (firstInput) firstInput.focus();
    }, 100);
    
    console.log('Secret number (for testing):', this.secretNumber.join(''));
  }
  
  generateSecretNumber() {
    const length = this.config[this.currentMode].length;
    let digits = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    
    // First digit cannot be 0
    const first = digits[Math.floor(Math.random() * digits.length)];
    const secret = [first];
    
    // Remaining digits can include 0
    digits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].filter(d => d !== first);
    
    while (secret.length < length) {
      const idx = Math.floor(Math.random() * digits.length);
      const digit = digits.splice(idx, 1)[0];
      secret.push(digit);
    }
    
    return secret;
  }
  
  updateInputs() {
    const length = this.config[this.currentMode].length;
    const inputsContainer = document.getElementById('inputs');
    
    let html = '';
    for (let i = 0; i < length; i++) {
      html += `
        <input type="number" 
               min="0" 
               max="9" 
               maxlength="1" 
               class="guess-input" 
               required
               data-index="${i}"
               autocomplete="off">
      `;
    }
    
    inputsContainer.innerHTML = html;
    document.getElementById('currentLength').textContent = length;
  }
  
  handleInputNavigation(input) {
    const index = parseInt(input.dataset.index);
    const inputs = Array.from(document.querySelectorAll('.guess-input'));
    
    if (input.value.length === 1 && index < inputs.length - 1) {
      inputs[index + 1].focus();
    }
    
    // Update filled class
    if (input.value) {
      input.classList.add('filled');
    } else {
      input.classList.remove('filled');
    }
  }
  
  updateAttemptInfo() {
    const maxAttempts = this.config[this.currentMode].maxAttempts;
    document.getElementById('attemptInfo').textContent = 
      `${this.attempts}/${maxAttempts}`;
  }
  
  updateHintButton() {
    const hintBtn = document.getElementById('hintBtn');
    hintBtn.innerHTML = `<i class="fas fa-lightbulb"></i> GỢI Ý (${this.hintsLeft})`;
    hintBtn.disabled = this.hintsLeft === 0;
  }
  
  updateStats() {
    document.getElementById('score').textContent = this.score;
    document.getElementById('highscore').textContent = this.highScore;
    document.getElementById('currentScore').textContent = this.calculateCurrentGameScore();
  }
  
  startTimer() {
    this.stopTimer();
    this.startTime = Date.now();
    
    this.timerInterval = setInterval(() => {
      const elapsed = Date.now() - this.startTime;
      const minutes = Math.floor(elapsed / 60000);
      const seconds = Math.floor((elapsed % 60000) / 1000);
      document.getElementById('timer').textContent = 
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }, 1000);
  }
  
  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }
  
  handleGuess(event) {
    event.preventDefault();
    
    if (!this.gameActive) return;
    
    const inputs = Array.from(document.querySelectorAll('.guess-input'));
    const guess = inputs.map(inp => Number(inp.value));
    
    // Validate guess
    const validation = this.validateGuess(guess);
    if (!validation.valid) {
      document.getElementById('error').textContent = validation.message;
      return;
    }
    
    // Clear error
    document.getElementById('error').textContent = '';
    
    // Check guess
    const result = this.checkGuess(guess);
    this.attempts++;
    this.history.push({ guess: [...guess], result: [...result] });
    
    // Update UI
    this.displayHistory();
    this.updateAttemptInfo();
    this.updateStats();
    
    // Check game end
    if (this.isCorrect(result)) {
      this.endGame(true);
    } else if (this.attempts >= this.config[this.currentMode].maxAttempts) {
      this.endGame(false);
    } else {
      // Clear inputs for next guess
      inputs.forEach(inp => {
        inp.value = '';
        inp.classList.remove('filled');
      });
      inputs[0].focus();
    }
  }
  
  validateGuess(guess) {
    const length = this.config[this.currentMode].length;
    
    // Check all digits are numbers
    if (guess.length !== length || guess.some(isNaN)) {
      return { valid: false, message: `Vui lòng nhập đủ ${length} chữ số!` };
    }
    
    // First digit cannot be 0
    if (guess[0] === 0) {
      return { valid: false, message: 'Chữ số đầu tiên phải khác 0!' };
    }
    
    // Check for duplicates
    const set = new Set(guess);
    if (set.size !== length) {
      return { valid: false, message: 'Không được nhập các chữ số trùng nhau!' };
    }
    
    // Check range
    if (guess.some(d => d < 0 || d > 9)) {
      return { valid: false, message: 'Chỉ được nhập các số từ 0-9!' };
    }
    
    return { valid: true, message: '' };
  }
  
  checkGuess(guess) {
    const result = Array(this.config[this.currentMode].length).fill(0);
    
    for (let i = 0; i < guess.length; i++) {
      if (guess[i] === this.secretNumber[i]) {
        result[i] = 2; // Correct digit and position
      } else if (this.secretNumber.includes(guess[i])) {
        result[i] = 1; // Correct digit, wrong position
      }
    }
    
    return result;
  }
  
  isCorrect(result) {
    return result.every(r => r === 2);
  }
  
  displayHistory() {
    const historyContainer = document.getElementById('history');
    
    this.history.forEach((entry, index) => {
      const historyItem = document.createElement('div');
      historyItem.className = 'history-item';
      historyItem.innerHTML = `
        <div class="history-guess">
          ${entry.guess.map(d => `<span>${d}</span>`).join('')}
        </div>
        <div class="history-result">
          ${entry.result.map(res => {
            let iconClass = '';
            let icon = '';
            
            if (res === 2) {
              iconClass = 'correct';
              icon = '<i class="fas fa-check"></i>';
            } else if (res === 1) {
              iconClass = 'partial';
              icon = '<i class="fas fa-exchange-alt"></i>';
            } else {
              iconClass = 'wrong';
              icon = '<i class="fas fa-times"></i>';
            }
            
            return `<span class="result-icon ${iconClass}">${icon}</span>`;
          }).join('')}
        </div>
      `;
      
      historyContainer.prepend(historyItem);
    });
  }
  
  giveHint() {
    if (this.hintsLeft === 0 || !this.gameActive) return;
    
    this.hintsLeft--;
    
    // Find a digit that hasn't been revealed yet
    const revealed = new Set();
    this.history.forEach(entry => {
      entry.guess.forEach((digit, index) => {
        if (entry.result[index] === 2) {
          revealed.add(digit);
        }
      });
    });
    
    // Find unrevealed positions
    const unrevealedPositions = [];
    for (let i = 0; i < this.secretNumber.length; i++) {
      if (!revealed.has(this.secretNumber[i])) {
        unrevealedPositions.push(i);
      }
    }
    
    if (unrevealedPositions.length === 0) return;
    
    // Reveal a random digit
    const randomPos = unrevealedPositions[Math.floor(Math.random() * unrevealedPositions.length)];
    const digit = this.secretNumber[randomPos];
    
    // Show hint
    const hintMessage = `💡 Gợi ý: Chữ số ở vị trí ${randomPos + 1} là ${digit}`;
    document.getElementById('error').textContent = hintMessage;
    document.getElementById('error').style.color = '#ff9800';
    
    this.updateHintButton();
    
    // Auto-clear hint after 3 seconds
    setTimeout(() => {
      if (document.getElementById('error').textContent === hintMessage) {
        document.getElementById('error').textContent = '';
      }
    }, 3000);
  }
  
  calculateCurrentGameScore() {
    if (this.history.length === 0) return 0;
    
    const baseScore = 1000;
    const timeBonus = Math.max(0, 300 - Math.floor((Date.now() - this.startTime) / 1000));
    const attemptsBonus = (this.config[this.currentMode].maxAttempts - this.attempts) * 50;
    const multiplier = this.config[this.currentMode].multiplier;
    const hintPenalty = (3 - this.hintsLeft) * 100;
    
    return Math.max(0, (baseScore + timeBonus + attemptsBonus - hintPenalty) * multiplier);
  }
  
  endGame(win) {
    this.gameActive = false;
    this.stopTimer();
    
    const endMessage = document.getElementById('endMessage');
    const playAgainContainer = document.getElementById('playAgain');
    
    if (win) {
      const gameScore = this.calculateCurrentGameScore();
      this.score += gameScore;
      
      if (this.score > this.highScore) {
        this.highScore = this.score;
        this.saveHighScore();
      }
      
      endMessage.innerHTML = `
        <div class="win">
          <i class="fas fa-trophy"></i>
          <h3>🎉 CHÚC MỪNG!</h3>
          <p>Bạn đã đoán đúng số sau ${this.attempts} lần thử!</p>
          <p class="score-display">Điểm nhận được: <strong>${gameScore}</strong></p>
          <p class="total-score">Tổng điểm: <strong>${this.score}</strong></p>
        </div>
      `;
      endMessage.className = 'end-message win';
      
      // Save to leaderboard
      this.saveToLeaderboard(gameScore);
    } else {
      endMessage.innerHTML = `
        <div class="lose">
          <i class="fas fa-skull-crossbones"></i>
          <h3>💀 GAME OVER!</h3>
          <p>Bạn đã hết lượt đoán.</p>
          <p>Số bí mật là: <strong>${this.secretNumber.join(' ')}</strong></p>
          <p>Hãy thử lại lần sau!</p>
        </div>
      `;
      endMessage.className = 'end-message lose';
    }
    
    playAgainContainer.style.display = 'block';
    document.getElementById('guessForm').style.display = 'none';
    this.updateStats();
    this.updateLeaderboard();
  }
  
  saveToLeaderboard(score) {
    const leaderboard = this.loadLeaderboard();
    const playerName = prompt('Nhập tên của bạn để lưu vào bảng xếp hạng:', 'Người chơi');
    
    if (playerName) {
      const entry = {
        name: playerName.substring(0, 20),
        score: score,
        mode: this.currentMode,
        date: new Date().toISOString(),
        attempts: this.attempts
      };
      
      leaderboard.push(entry);
      
      // Sort by score descending
      leaderboard.sort((a, b) => b.score - a.score);
      
      // Keep only top 10
      if (leaderboard.length > 10) {
        leaderboard.splice(10);
      }
      
      localStorage.setItem('numberGuessLeaderboard', JSON.stringify(leaderboard));
    }
  }
  
  loadLeaderboard() {
    try {
      const data = localStorage.getItem('numberGuessLeaderboard');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }
  
  updateLeaderboard(mode = 'easy') {
    const leaderboard = this.loadLeaderboard();
    const container = document.getElementById('leaderboard');
    
    // Filter by mode and sort
    const filtered = leaderboard
      .filter(entry => entry.mode === mode)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
    
    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="leaderboard-placeholder">
          <i class="fas fa-chart-line"></i>
          <p>Chưa có dữ liệu xếp hạng</p>
          <p class="small">Hãy hoàn thành ván chơi để lưu điểm!</p>
        </div>
      `;
      return;
    }
    
    let html = '';
    filtered.forEach((entry, index) => {
      const rankClass = index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'bronze' : '';
      const date = new Date(entry.date).toLocaleDateString('vi-VN');
      
      html += `
        <div class="leaderboard-item">
          <div class="leaderboard-rank ${rankClass}">${index + 1}</div>
          <div class="leaderboard-info">
            <div class="leaderboard-name">${entry.name}</div>
            <div class="leaderboard-details">
              <span>${date}</span>
              <span>${entry.attempts} lượt</span>
              <span>${entry.mode === 'easy' ? 'Dễ' : entry.mode === 'normal' ? 'Thường' : 'Khó'}</span>
            </div>
          </div>
          <div class="leaderboard-score">${entry.score}</div>
        </div>
      `;
    });
    
    container.innerHTML = html;
  }
  
  changeLeaderboardTab(tabButton) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    tabButton.classList.add('active');
    
    const mode = tabButton.dataset.tab;
    this.updateLeaderboard(mode);
  }
  
  loadHighScore() {
    try {
      const score = localStorage.getItem('numberGuessHighScore');
      return score ? parseInt(score) : 0;
    } catch {
      return 0;
    }
  }
  
  saveHighScore() {
    localStorage.setItem('numberGuessHighScore', this.highScore.toString());
  }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
  window.game = new NumberGuessingGame();
});
