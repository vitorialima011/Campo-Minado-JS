let cells = [];
let boardSize;
let bombCount;
let gameOver = false;
let firstMove = true; // Controla se o primeiro clique já ocorreu

let currentLevel = 1; // Inicia no nível 1

// Diálogos do tutorial – narrativa enriquecida
const tutorialDialogues = [
  "CORONEL: Soldado, nossa missão é clara: desarmar as bombas espalhadas por essa selva para abrir caminho à nossa tropa para acabarmos com os vietnamitas.",
  "CORONEL: Cada quadrado deste campo pode esconder uma bomba; os números mostram quantas há ao redor. Foque e seja preciso.",
  "CORONEL: No seu primeiro clique, garantiremos uma área segura para que você comece sem riscos.",
  "CORONEL: Avance com cautela, o destino desta missão está em suas mãos.",
  "SOLDADO:(Pensando) Me pergundo o que o coronel tende a fazer com as pobres pessoas da vila que iremos invadir..."
];

let levelDialogues = [];  // Diálogos para transição entre níveis

let currentDialogueLines = [];
let currentDialogueIndex = 0;
let dialogueActive = true;
let isTutorial = true;

// Inicia os diálogos assim que a página carregar
window.onload = function() {
  isTutorial = true;
  currentDialogueLines = tutorialDialogues;
  currentDialogueIndex = 0;
  showDialogue();
};

// Exibe o diálogo atual no banner e atualiza o container de personagem
function showDialogue() {
  const dialogueBox = document.getElementById("dialogue-box");
  dialogueBox.style.display = "flex";
  const text = currentDialogueLines[currentDialogueIndex];
  document.getElementById("dialogue-content").textContent = text;
  updateDialogueCharacter(text);
}

// Atualiza o container da imagem/caption de acordo com o diálogo
function updateDialogueCharacter(text) {
  const dialogueCharacter = document.getElementById("dialogue-character");
  dialogueCharacter.innerHTML = ""; // Limpa conteúdo anterior
  dialogueCharacter.classList.remove("centered");
  
  if (text.startsWith("CORONEL:")) {
    // Se for do Coronel: mostra a imagem do coronel e sua legenda; alinhado à esquerda
    dialogueCharacter.innerHTML = '<img src="coronelputo.png" alt="Coronel"><div class="caption">Coronel</div>';
  } else if (text.startsWith("HEROI:")) {
    // Se for do Herói: mostra a imagem do herói com legenda "Você" e centraliza
    dialogueCharacter.innerHTML = '<img src="ididnothingatall.png" alt="Você"><div class="caption">Você</div>';
    dialogueCharacter.classList.add("centered");
  }
}

// Avança o diálogo ao pressionar Enter (aceita e.key ou e.keyCode)
document.addEventListener("keydown", function(e) {
  if (dialogueActive && (e.key === "Enter" || e.keyCode === 13)) {
    currentDialogueIndex++;
    if (currentDialogueIndex < currentDialogueLines.length) {
      const text = currentDialogueLines[currentDialogueIndex];
      document.getElementById("dialogue-content").textContent = text;
      updateDialogueCharacter(text);
    } else {
      dialogueActive = false;
      document.getElementById("dialogue-box").style.display = "none";
      startGame();
    }
  }
});

// Exibe uma mensagem (vitória/derrota) na tela por 2 segundos
function displayMessage(msg, callback) {
  const msgDiv = document.getElementById("message");
  msgDiv.textContent = msg;
  setTimeout(() => {
    msgDiv.textContent = "";
    callback();
  }, 2000);
}

function startGame() {
  // Impede o início se os diálogos ainda estiverem ativos
  if (dialogueActive) return;
  
  // O tamanho do campo aumenta com o nível: nível 1 = 10x10, nível 2 = 12x12, etc.
  boardSize = 10 + (currentLevel - 1) * 2;
  // A quantidade de bombas é ~15% do total, com acréscimo de 2 por nível.
  bombCount = Math.floor((boardSize * boardSize) * 0.15) + (currentLevel - 1) * 2;
  
  gameOver = false;
  firstMove = true;
  
  const gameBoard = document.getElementById("game-board");
  gameBoard.innerHTML = '';
  gameBoard.style.gridTemplateColumns = `repeat(${boardSize}, 40px)`;
  
  cells = [];
  for (let i = 0; i < boardSize * boardSize; i++) {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    cell.dataset.index = i;
    
    // Clique esquerdo para revelar
    cell.addEventListener("click", () => handleCellClick(cell));
    // Clique direito para alternar bandeira
    cell.addEventListener("contextmenu", function(e) { 
      e.preventDefault(); 
      toggleFlag(cell); 
    });
    
    gameBoard.appendChild(cell);
    cells.push(cell);
  }
}

function toggleFlag(cell) {
  if (cell.classList.contains("revealed")) return;
  if (cell.classList.contains("flag")) {
    cell.classList.remove("flag");
    cell.textContent = "";
  } else {
    cell.classList.add("flag");
    cell.textContent = "🚩";
  }
}

function generateBombs(initialIndex) {
  initialIndex = parseInt(initialIndex);
  let safeZone = new Set();
  const row = Math.floor(initialIndex / boardSize);
  const col = initialIndex % boardSize;
  
  // Zona segura: a célula clicada e seus vizinhos imediatos
  for (let i = row - 1; i <= row + 1; i++) {
    for (let j = col - 1; j <= col + 1; j++) {
      if (i < 0 || i >= boardSize || j < 0 || j >= boardSize) continue;
      safeZone.add(i * boardSize + j);
    }
  }
  
  let bombPositions = new Set();
  while (bombPositions.size < bombCount) {
    let randomIndex = Math.floor(Math.random() * cells.length);
    if (!safeZone.has(randomIndex)) {
      bombPositions.add(randomIndex);
    }
  }
  
  bombPositions.forEach(index => {
    cells[index].dataset.bomb = "true";
  });
}

function calculateNumbers() {
  for (let i = 0; i < cells.length; i++) {
    if (!cells[i].dataset.bomb) {
      let count = countAdjacentBombs(i);
      cells[i].dataset.count = count;
    }
  }
}

function countAdjacentBombs(index) {
  const row = Math.floor(index / boardSize);
  const col = index % boardSize;
  let count = 0;
  for (let i = row - 1; i <= row + 1; i++) {
    for (let j = col - 1; j <= col + 1; j++) {
      if (i < 0 || i >= boardSize || j < 0 || j >= boardSize) continue;
      if (i === row && j === col) continue;
      const neighborIndex = i * boardSize + j;
      if (cells[neighborIndex].dataset.bomb === "true") count++;
    }
  }
  return count;
}

function handleCellClick(cell) {
  if (gameOver || cell.classList.contains("revealed") || cell.classList.contains("flag")) return;
  
  if (firstMove) {
    generateBombs(cell.dataset.index);
    calculateNumbers();
    firstMove = false;
  }
  
  if (cell.dataset.bomb === "true") {
    cell.classList.add("bomb");
    revealBombs();
    gameOver = true;
    displayMessage("💥 Você perdeu! Reiniciando nível...", () => startGame());
    return;
  }
  
  revealCell(cell);
  
  if (checkWin()) {
    gameOver = true;
    displayMessage(`🎉 Você venceu o nível ${currentLevel}!`, nextLevel);
  }
}

function revealCell(cell) {
  if (cell.classList.contains("revealed")) return;
  
  cell.classList.add("revealed");
  if (cell.classList.contains("flag")) {
    cell.classList.remove("flag");
  }
  
  const count = parseInt(cell.dataset.count) || 0;
  if (count > 0) {
    cell.textContent = count;
    cell.style.color = getNumberColor(count);
  } else {
    const index = parseInt(cell.dataset.index);
    const row = Math.floor(index / boardSize);
    const col = index % boardSize;
    for (let i = row - 1; i <= row + 1; i++) {
      for (let j = col - 1; j <= col + 1; j++) {
        if (i < 0 || i >= boardSize || j < 0 || j >= boardSize) continue;
        const neighborIndex = i * boardSize + j;
        revealCell(cells[neighborIndex]);
      }
    }
  }
}

function getNumberColor(count) {
  const colors = {
    1: "#0000FF",
    2: "#008200",
    3: "#FF0000",
    4: "#000084",
    5: "#840000",
    6: "#008284",
    7: "#000000",
    8: "#848484"
  };
  return colors[count] || "#000";
}

function revealBombs() {
  cells.forEach(cell => {
    if (cell.dataset.bomb === "true") {
      cell.classList.add("bomb");
      cell.textContent = "💣";
    }
  });
}

function checkWin() {
  return cells.every(cell => cell.dataset.bomb === "true" || cell.classList.contains("revealed"));
}

/* SISTEMA DE NÍVEIS E DIÁLOGOS DE TRANSIÇÃO
   A narrativa evolui conforme o nível:
   - Níveis 1–2: O Coronel exalta a missão.
   - Níveis 3–4: O Herói começa a questionar.
   - A partir do nível 5: O conflito interno se intensifica.
*/
function nextLevel() {
  currentLevel++;
  
  if (currentLevel < 3) {
    levelDialogues = [
      `CORONEL: Excelente, soldado! Você finalizou o nível ${currentLevel - 1}.`,
      `CORONEL: Prepare-se, o próximo desafio se aproxima!`
    ];
  } else if (currentLevel < 5) {
    levelDialogues = [
      `CORONEL: Soldado, mais uma missão concluída no nível ${currentLevel - 1}.`,
      `HEROI: Coronel, você nunca pensou nas famílias destas pessoas nas quais já matamos?.`,
      `CORONEL: Não permita dúvidas, avance sem olhar para trás!`
    ];
  } else {
    levelDialogues = [
      `CORONEL: Soldado, você finalizou o nível ${currentLevel - 1}.`,
      `HEROI: Já não posso ignorar o horror que vejo... Preciso agir!`,
      `CORONEL: A disciplina é nossa maior arma. Siga as ordens, custe o que custar!`,
      `HEROI: Talvez seja hora de fazer a justiça, mesmo que eu pague um preço alto!`
    ];
  }
  
  isTutorial = false;
  currentDialogueLines = levelDialogues;
  currentDialogueIndex = 0;
  dialogueActive = true;
  document.getElementById("dialogue-box").style.display = "flex";
  showDialogue();
}
