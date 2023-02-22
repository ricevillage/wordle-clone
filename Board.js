export class Board {
  constructor(maxGuesses, maxWordLength) {
    this.row = maxGuesses;
    this.col = maxWordLength;

    this.qwertyLayout = [
      ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
      ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
      ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "<"],
    ];
  }

  initBoard() {
    const boardDiv = document.querySelector("#board");
    const keyboardDiv = document.querySelector("#keyboard");

    boardDiv.style.setProperty("--grid-rows", this.row);
    boardDiv.style.setProperty("--grid-cols", this.col);

    for (let i = 0; i < this.col * this.row; i++) {
      const cell = document.createElement("div");
      cell.classList.add("board-cell", `${i}`);
      boardDiv.appendChild(cell);
    }

    for (let i = 0; i < this.qwertyLayout.length; i++) {
      const rowElement = document.createElement("div");
      rowElement.classList.add("keyboard-row");
      keyboardDiv.appendChild(rowElement);

      for (let j = 0; j < this.qwertyLayout[i].length; j++) {
        const letter = this.qwertyLayout[i][j];
        const key = document.createElement("button");
        key.classList.add("key");
        key.setAttribute("data-letter", letter);
        key.textContent = letter;
        rowElement.appendChild(key);
      }
    }
  }
}
