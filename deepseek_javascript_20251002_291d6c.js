// Game config
const numLength = 5;
const maxAttempts = 10;
let secretNumber = [];
let attempts = 0;
let history = [];

document.getElementById('numLength').textContent = numLength;

function generateSecretNumber() {
  let digits = [1,2,3,4,5,6,7,8,9];
  let first = digits[Math.floor(Math.random() * digits.length)];
  secretNumber = [first];
  digits = [0,1,2,3,4,5,6,7,8,9].filter(d => d !== first);
  while (secretNumber.length < numLength) {
    let idx = Math.floor(Math.random() * digits.length);
    let digit = digits.splice(idx, 1)[0];
    secretNumber.push(digit);
  }
}

function checkGuess(guess) {
  let result = Array(numLength).fill(0);
  for (let i = 0; i < numLength; i++) {
    if (guess[i] === secretNumber[i]) {
      result[i] = 2;
    } else if (secretNumber.includes(guess[i])) {
      result[i] = 1;
    }
  }
  return result;
}

function isCorrect(result) {
  return result.every(r => r === 2);
}

function displayHistory() {
  let html = '';
  for (let entry of history) {
    html += '<div class="result-row">';
    html += entry.guess.map(d => `<span>${d}</span>`).join(' ');
    html += ' &nbsp; ';
    html += entry.result.map(res => {
      if (res === 2) return '<span class="symbol" style="color:#388e3c;">✓</span>';
      if (res === 1) return '<span class="symbol" style="color:#f7b731;">○</span>';
      return '<span class="symbol" style="color:#d32f2f;">✗</span>';
    }).join(' ');
    html += '</div>';
  }
  document.getElementById('history').innerHTML = html;
}

function showEndMessage(win) {
  const endMsg = document.getElementById('endMessage');
  if (win) {
    endMsg.innerHTML = `<span class="win">🎉 CHÚC MỪNG! Bạn đã đoán đúng số sau ${attempts} lần thử!</span>`;
    endMsg.classList.add('win');
  } else {
    endMsg.innerHTML = `💀 GAME OVER! Bạn đã hết lượt đoán.<br>Số bí mật là: <b>${secretNumber.join(' ')}</b>`;
    endMsg.classList.remove('win');
  }
  document.getElementById('playAgain').style.display = 'block';
}

function resetGame() {
  generateSecretNumber();
  attempts = 0;
  history = [];
  document.getElementById('history').innerHTML = '';
  document.getElementById('endMessage').innerHTML = '';
  document.getElementById('endMessage').classList.remove('win');
  document.getElementById('playAgain').style.display = 'none';
  document.getElementById('error').textContent = '';
  displayInputs();
  updateAttemptInfo();
  document.getElementById('guessForm').style.display = '';
}

function displayInputs() {
  let html = '';
  for (let i = 0; i < numLength; i++) {
    html += `<input type="number" min="0" max="9" maxlength="1" class="guess-input" required>`;
  }
  document.getElementById('inputs').innerHTML = html;
}

function updateAttemptInfo() {
  document.getElementById('attemptInfo').textContent = `Lần đoán thứ ${attempts + 1}/${maxAttempts}`;
}

// Event listeners
document.getElementById('guessForm').onsubmit = function(e) {
  e.preventDefault();
  document.getElementById('error').textContent = '';
  let inputs = Array.from(document.querySelectorAll('.guess-input'));
  let guess = inputs.map(inp => Number(inp.value));
  // Validation
  if (guess.length !== numLength || guess.some(isNaN)) {
    document.getElementById('error').textContent = `Vui lòng nhập đủ ${numLength} chữ số!`;
    return;
  }
  if (guess[0] === 0) {
    document.getElementById('error').textContent = 'Chữ số đầu tiên phải khác 0!';
    return;
  }
  let set = new Set(guess);
  if (set.size !== numLength) {
    document.getElementById('error').textContent = 'Không được nhập các chữ số trùng nhau!';
    return;
  }
  if (guess.some(d => d < 0 || d > 9)) {
    document.getElementById('error').textContent = 'Chỉ được nhập các số từ 0-9!';
    return;
  }
  // Play
  let result = checkGuess(guess);
  attempts++;
  history.push({guess, result});
  displayHistory();
  updateAttemptInfo();
  if (isCorrect(result)) {
    showEndMessage(true);
    document.getElementById('guessForm').style.display = 'none';
  } else if (attempts >= maxAttempts) {
    showEndMessage(false);
    document.getElementById('guessForm').style.display = 'none';
  } else {
    inputs.forEach(inp => inp.value = '');
    inputs[0].focus();
  }
};

document.getElementById('playAgain').onclick = resetGame;

// Khởi động game lần đầu
resetGame();
