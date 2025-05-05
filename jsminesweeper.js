const game = document.getElementById("game");
let rows, cols, minesCount;
let board, revealed, flagged;
let firstClick = true;
let gameOver = false;

function resetGame() {
  // Define as configurações conforme a dificuldade selecionada
  const difficulty = document.getElementById("difficulty").value;
  if (difficulty === "easy") {
    rows = 8; cols = 8; minesCount = 10;
  } else if (difficulty === "medium") {
    rows = 10; cols = 10; minesCount = 20;
  } else if (difficulty === "hard") {
    rows = 12; cols = 12; minesCount = 30;
  }

  gameOver = false;
  firstClick = true;
  // Vetores para armazenar o conteúdo do tabuleiro e o status de cada célula
  board = Array(rows * cols).fill(0);
  revealed = Array(rows * cols).fill(false);
  flagged = Array(rows * cols).fill(false);

  // Configura a grid e limpa o tabuleiro
  game.innerHTML = "";
  game.style.gridTemplateColumns = `repeat(${cols}, 40px)`;

  // Cria cada célula e associa os eventos de clique (esquerdo e direito)
  for (let i = 0; i < rows * cols; i++) {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    cell.dataset.index = i;

    cell.addEventListener("click", () => handleLeftClick(i));

    // Captura o clique direito para marcar/desmarcar bandeira
    cell.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      handleRightClick(i);
    });

    game.appendChild(cell);
  }
}

// Gera o tabuleiro com minas, garantindo que os índices seguros sejam excluídos
function generateBoard(excludedIndex) {
  // Exclui o primeiro clique e seus vizinhos para garantir uma jogada segura
  const safeIndices = new Set();
  safeIndices.add(excludedIndex);
  getNeighbors(excludedIndex).forEach(n => safeIndices.add(n));

  let placedMines = 0;
  // Reajusta todas as posições para 0 antes de colocar as minas
  board = board.map(() => 0);
  while (placedMines < minesCount) {
    const pos = Math.floor(Math.random() * board.length);
    if (safeIndices.has(pos)) continue;
    if (board[pos] !== "M") {
      board[pos] = "M";
      placedMines++;
    }
  }
  // Calcula os números para cada célula sem mina
  for (let i = 0; i < board.length; i++) {
    if (board[i] === "M") continue;
    let count = 0;
    getNeighbors(i).forEach(n => {
      if (board[n] === "M") count++;
    });
    board[i] = count;
  }
}

// Lida com o clique esquerdo
function handleLeftClick(index) {
  if (gameOver) return;
  // Se for a primeira jogada, gera o tabuleiro de forma que a célula clicada (e seus vizinhos) fiquem seguros
  if (firstClick) {
    firstClick = false;
    generateBoard(index);
  }
  revealCell(index);
}

// Lida com o clique direito para marcar/desmarcar bandeiras
function handleRightClick(index) {
  if (gameOver) return;
  if (revealed[index]) return; // Não pode marcar células já reveladas
  flagged[index] = !flagged[index];
  const cell = document.querySelector(`[data-index="${index}"]`);
  if (flagged[index]) {
    cell.classList.add("flagged");
  } else {
    cell.classList.remove("flagged");
  }
}

// Revela a célula e, se for vazia (0), expande para os vizinhos
function revealCell(index) {
  if (revealed[index] || flagged[index]) return;
  revealed[index] = true;
  const cell = document.querySelector(`[data-index="${index}"]`);
  cell.classList.add("revealed");

  // Se a célula contém uma mina, exibe-a, revela todas as minas e termina o jogo
  if (board[index] === "M") {
    cell.classList.add("mine");
    gameOver = true;
    revealAllMines();
    setTimeout(() => alert("💥 Você perdeu!"), 100);
    return;
  }

  // Exibe o número (se houver) ou nada se for zero
  if (board[index] > 0) {
    cell.textContent = board[index];
  } else {
    // Se for 0, expande para os vizinhos
    cell.textContent = "";
    getNeighbors(index).forEach(neighbor => revealCell(neighbor));
  }

  checkWinCondition();
}

// Revela todas as minas (útil ao perder ou ganhar)
function revealAllMines() {
  board.forEach((value, index) => {
    if (value === "M") {
      const cell = document.querySelector(`[data-index="${index}"]`);
      if (cell) cell.classList.add("revealed", "mine");
    }
  });
}

// Verifica se o jogador venceu (todas as células que não são minas foram reveladas)
function checkWinCondition() {
  let won = true;
  for (let i = 0; i < board.length; i++) {
    if (board[i] !== "M" && !revealed[i]) {
      won = false;
      break;
    }
  }
  if (won) {
    gameOver = true;
    revealAllMines();
    setTimeout(() => alert("🎉 Você venceu!"), 100);
  }
}

// Retorna os índices dos vizinhos de uma dada célula
function getNeighbors(index) {
  const x = index % cols;
  const y = Math.floor(index / cols);
  const neighbors = [];
  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      if (dx === 0 && dy === 0) continue;
      const nx = x + dx;
      const ny = y + dy;
      if (nx >= 0 && nx < cols && ny >= 0 && ny < rows) {
        neighbors.push(ny * cols + nx);
      }
    }
  }
  return neighbors;
}

// Inicia o jogo ao carregar a página
resetGame();
