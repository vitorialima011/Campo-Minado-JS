const game = document.getElementById("game");
const rows = 10;
const cols = 10;
const minesCount = 20;
let board = Array(rows * cols).fill(0);

// Colocar minas aleatoriamente
for (let i = 0; i < minesCount; i++) {
    let pos;
    do {
        pos = Math.floor(Math.random() * board.length);
    } while (board[pos] === "M");
    board[pos] = "M";
}

// Criar tabuleiro
board.forEach((cell, index) => {
    const cellElement = document.createElement("div");
    cellElement.classList.add("cell");
    cellElement.dataset.index = index;
    
    cellElement.addEventListener("click", () => {
        if (cell === "M") {
            cellElement.classList.add("mine");
            alert("Fim de Jogo!");
        } else {
            cellElement.style.backgroundColor = "#fff";
        }
    });

    game.appendChild(cellElement);
});
