// JavaScript logic giữ nguyên từ phiên bản trước
// Chỉ cần cập nhật các selector cho giao diện mới

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
    // Mode selection - Cập nhật selector
    document.querySelectorAll('.mode-card').forEach(btn => {
      btn.addEventListener('click', (e) => this.changeMode(e.currentTarget));
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
      if (e.target.classList.contains('number-input')) {
        this.handleInputNavigation(e.target);
      }
    });
    
    // Theme toggle
    document.getElementById('themeToggle').addEventListener('click', () => this.toggleTheme());
  }
  
  changeMode(modeButton) {
    // Update active mode
    document.querySelectorAll('.mode-card').forEach(btn => btn.classList.remove('active'));
    modeButton.classList.add('active');
    
    // Update current mode
    this.currentMode = modeButton.dataset.mode;
    
    // Update level display
    const levelText = this.currentMode === 'easy' ? 'Easy' : 
                     this.currentMode === 'normal' ? 'Medium' : 'Hard';
    document.getElementById('level').textContent = levelText;
    
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
    document.getElementById('endMessage').style.display = 'none';
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
      const firstInput = document.querySelector('.number-input');
      if (firstInput) firstInput.focus();
    }, 100);
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
               class="number-input" 
               required
               data-index="${i}"
               autocomplete="off">
      `;
    }
    
    inputsContainer.innerHTML = html;
    inputsContainer.className = 'input-grid';
    document.getElementById('currentLength').textContent = length;
  }
  
  // Các phương thức khác giữ nguyên...
  
  displayHistory() {
    const historyContainer = document.getElementById('history');
    
    this.history.forEach((entry, index) => {
      const historyItem = document.createElement('div');
      historyItem.className = 'history-item';
      historyItem.innerHTML = `
        <div class="guess-display">
          ${entry.guess.map(d => `<span>${d}</span>`).join('')}
        </div>
        <div class="result-display">
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
  
  updateHintButton() {
    const hintBtn = document.getElementById('hintBtn');
    const hintCount = document.getElementById('hintCount');
    hintCount.textContent = `(${this.hintsLeft})`;
    hintBtn.disabled = this.hintsLeft === 0;
  }
  
  toggleTheme() {
    document.body.classList.toggle('dark-theme');
    const themeBtn = document.getElementById('themeToggle');
    const icon = themeBtn.querySelector('i');
    const text = themeBtn.querySelector('span') || themeBtn;
    
    if (document.body.classList.contains('dark-theme')) {
      icon.className = 'fas fa-sun';
      text.textContent = 'Light Mode';
      this.applyDarkTheme();
    } else {
      icon.className = 'fas fa-moon';
      text.textContent = 'Dark Mode';
      this.applyLightTheme();
    }
  }
  
  applyDarkTheme() {
    // Thêm CSS cho dark theme
    const darkThemeCSS = `
      .dark-theme {
        --dark: #f3f4f6;
        --dark-light: #e5e7eb;
        --light: #1f2937;
        --white: #111827;
        --gray: #9ca3af;
        --gray-light: #6b7280;
      }
      
      .dark-theme body {
        background: linear-gradient(135deg, #1e3a8a 0%, #7c3aed 100%);
      }
      
      .dark-theme .game-header,
      .dark-theme .game-footer,
      .dark-theme .mode-selector,
      .dark-theme .game-info-card,
      .dark-theme .center-panel,
      .dark-theme .leaderboard-card,
      .dark-theme .instructions-card {
        background: rgba(17, 24, 39, 0.95);
        border-color: rgba(255, 255, 255, 0.1);
      }
      
      .dark-theme .stat-card,
      .dark-theme .history-list,
      .dark-theme .mode-card,
      .dark-theme .stat-item {
        background: #374151;
      }
      
      .dark-theme .number-input {
        background: #374151;
        color: var(--dark);
        border-color: #4b5563;
      }
    `;
    
    // Thêm style nếu chưa có
    if (!document.getElementById('dark-theme-style')) {
      const style = document.createElement('style');
      style.id = 'dark-theme-style';
      style.textContent = darkThemeCSS;
      document.head.appendChild(style);
    }
  }
  
  applyLightTheme() {
    // Xóa style dark theme
    const darkThemeStyle = document.getElementById('dark-theme-style');
    if (darkThemeStyle) {
      darkThemeStyle.remove();
    }
  }
  
  // ... giữ nguyên các phương thức khác
}

// Khởi tạo game khi trang load
document.addEventListener('DOMContentLoaded', () => {
  const game = new NumberGuessingGame();
  window.game = game;
});
