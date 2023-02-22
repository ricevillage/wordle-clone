import { Board } from "./Board.js";

const URL =
  "https://raw.githubusercontent.com/chidiwilliams/wordle/main/src/data/words.json";

export class Wordle {
  constructor() {
    this.dataSetSize = 500;
    this.maxGuesses = 6;
    this.maxWordLength = 5;
    this.targetWord;
    this.guessWord = "";
    this.currentRow = 0;
    this.currentCol = -1;
    this.gameBoard = new Board(this.maxGuesses, this.maxWordLength);
    this.gameOver = false;
    this.domCells;
  }

  async getWordsFromAPI() {
    const response = await fetch(URL);
    const words = await response.json();
    return words.slice(0, this.dataSetSize);
  }

  async setTargetWord() {
    const wordArray = await this.getWordsFromAPI();
    const index = Math.floor(Math.random() * wordArray.length);
    return wordArray[index];
  }

  async initGame() {
    const targetWord = await this.setTargetWord();
    this.targetWord = targetWord;
    this.gameBoard.initBoard();
    this.initKeyBoardListener();
    this.domCells = document.querySelectorAll(".board-cell");
  }

  makeGuess(nextCharacter) {
    if (this.currentRow >= this.maxGuesses) {
      return;
    }

    if (this.gameOver) {
      return;
    }

    let operation;
    switch (nextCharacter) {
      case "backspace":
        this.removeLastCharacter();
        break;
      case "enter":
        operation = "enter";
        this.updateGameBoard(operation);
        if (!this.gameOver) {
          this.moveToNextRow();
        }
        break;
      default:
        this.addCharacter(nextCharacter);
        break;
    }

    this.updateGameBoard();
  }

  addCharacter(character) {
    if (this.currentCol === this.maxWordLength - 1) {
      return;
    }

    this.guessWord += character;
    this.currentCol++;
  }

  removeLastCharacter() {
    if (this.currentCol < 0) {
      return;
    }

    this.guessWord = this.guessWord.slice(0, -1);
    this.currentCol--;
  }

  moveToNextRow() {
    if (this.guessWord.length === this.maxWordLength) {
      this.currentRow++;
      this.currentCol = -1;
      this.guessWord = "";
    }

    if (this.currentRow >= this.maxGuesses) {
      this.gameOver = true;
    }
  }

  updateGameBoard(operation) {
    for (let i = 0; i < this.maxWordLength; i++) {
      const cellIndex = i + this.currentRow * this.maxWordLength;
      const currentCell = this.domCells[cellIndex];

      currentCell.innerText = this.guessWord[i]
        ? this.guessWord[i].toUpperCase()
        : "";
    }

    if (operation === "enter" && this.guessWord.length === this.maxWordLength) {
      this.updateCellColors();

      if (
        this.currentRow >= this.maxGuesses - 1 ||
        this.guessWord === this.targetWord
      ) {
        this.gameOver = true;
        this.displayEndMessage();
      }
    }
  }

  updateCellColors() {
    for (let i = 0; i < this.maxWordLength; i++) {
      const cellIndex = i + this.currentRow * this.maxWordLength;
      const currentCell = this.domCells[cellIndex];

      if (this.guessWord[i] === this.targetWord[i]) {
        currentCell.classList.add("color-correct");
      } else if (this.targetWord.includes(this.guessWord[i])) {
        currentCell.classList.add("color-present");
      } else {
        currentCell.classList.add("color-absent");
      }
    }
  }

  displayEndMessage() {
    let message = "";

    if (this.gameOver) {
      message = `Game Over. The word was ${this.targetWord}.`;
    } else {
      message = `You Win! The word was ${this.targetWord}.`;
    }

    const messageElement = document.createElement("p");
    messageElement.innerText = message;
    messageElement.classList.add("end-message");
    document.body.appendChild(messageElement);
    document.removeEventListener("keydown", this.onKeyDown.bind(this), false);
  }

  onKeyDown(event) {
    const guess = event.key.toLowerCase();
    if (
      (guess.match(/^[a-z]$/) || guess === "backspace" || guess === "enter") &&
      !this.gameOver
    ) {
      this.makeGuess(guess);
    }
  }

  initKeyBoardListener() {
    document.addEventListener("keydown", this.onKeyDown.bind(this));
  }
}
