export class Board {
  constructor(maxGuesses, maxWordLength) {
    this.row = maxGuesses;
    this.col = maxWordLength;
  }

  initBoard() {
    const boardDiv = document.querySelector("#board");

    boardDiv.style.setProperty("--grid-rows", this.row);
    boardDiv.style.setProperty("--grid-cols", this.col);

    for (let i = 0; i < this.col * this.row; i++) {
      const cell = document.createElement("div");
      cell.classList.add("board-cell", `${i}`);
      boardDiv.appendChild(cell);
    }
  }
}
