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
    // randomly sort: sorting function returns value of -1 or 1
    const shuffledWords = words.sort(() => Math.random() - 0.5);
    return shuffledWords.slice(0, this.dataSetSize);
  }

  async setTargetWord() {
    const wordArray = await this.getWordsFromAPI();
    const index = Math.floor(Math.random() * wordArray.length);
    // return wordArray[index];
    return "bunny";
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
      case "<":
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

    const cellIndex =
      this.currentCol + this.currentRow * this.maxWordLength + 1;
    const currentCell = this.domCells[cellIndex];
    currentCell.classList.remove("pop-up");
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

  async popUpTiles(currentCell) {
    const delayTime = 80;
    setTimeout(() => {
      currentCell.classList.add("pop-up");
    }, delayTime);
  }

  updateGameBoard(operation) {
    for (let i = 0; i < this.maxWordLength; i++) {
      const cellIndex = i + this.currentRow * this.maxWordLength;
      const currentCell = this.domCells[cellIndex];

      currentCell.innerText = this.guessWord[i]
        ? this.guessWord[i].toUpperCase()
        : "";

      if (this.guessWord[i]) {
        this.popUpTiles(currentCell);
      }
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

  getFormatedGuess() {
    let solutionArray = [...this.targetWord];
    let formattedGuess = [...this.guessWord].map((letter) => {
      return { key: letter, status: "absent" };
    });

    // find any green letters
    for (let i = 0; i < formattedGuess.length; i++) {
      const currentLetter = formattedGuess[i].key;
      if (this.targetWord[i] === currentLetter) {
        formattedGuess[i].status = "correct";
        solutionArray[i] = null;
      }
    }

    // find any yellow letters
    for (let i = 0; i < formattedGuess.length; i++) {
      const currentLetter = formattedGuess[i].key;
      if (
        solutionArray.includes(currentLetter) &&
        formattedGuess[i].status !== "correct"
      ) {
        formattedGuess[i].status = "present";
        const index = solutionArray.indexOf(currentLetter);
        solutionArray[index] = null;
      }
    }
    return formattedGuess;
  }

  updateCellColors() {
    const formattedGuess = this.getFormatedGuess();

    for (let i = 0; i < formattedGuess.length; i++) {
      const cellIndex = i + this.currentRow * this.maxWordLength;
      const currentCell = this.domCells[cellIndex];
      const currentLetter = this.guessWord[i]?.toUpperCase();
      const currentKey = document.querySelector(
        `[data-letter="${currentLetter}"]`
      );

      currentCell.style.color = "#ffffff";
      currentKey.style.color = "#ffffff";

      const status = formattedGuess[i].status;
      currentCell.classList.add(`color-${status}`);
      currentKey.classList.add(`color-${status}`);

      if (this.guessWord === this.targetWord) {
        currentCell.classList.add("flip-in");
        currentCell.classList.add("flip-out");
      }
    }
  }

  displayEndMessage() {
    let message = "";

    if (this.gameOver) {
      message = `Game Over.\n The word was ${this.targetWord}.`;
    } else {
      message = `You Win! \n The word was ${this.targetWord}.`;
    }

    const messageOverlay = document.querySelector("#overlay");
    const messageH2 = document.querySelector("#message");
    messageH2.innerText = message;
    messageOverlay.style.display = "flex";
    document.removeEventListener("keydown", this.onKeyDown.bind(this), false);
    document.removeEventListener("click", this.onKeyClick.bind(this), false);
  }

  onKeyAction(guess) {
    if (
      (guess.match(/^[a-z]$/) ||
        guess === "backspace" ||
        guess === "<" ||
        guess === "enter") &&
      !this.gameOver
    ) {
      this.makeGuess(guess);
    }
  }

  onKeyDown(event) {
    const guess = event.key.toLowerCase();
    this.onKeyAction(guess);
  }

  onKeyClick(key) {
    key.addEventListener("click", () => {
      const guess = key.getAttribute("data-letter").toLowerCase();
      this.onKeyAction(guess);
    });
  }

  initKeyBoardListener() {
    document.addEventListener("keydown", this.onKeyDown.bind(this));
    const keyboard = document.querySelector("#keyboard");
    keyboard.querySelectorAll(".key").forEach((key) => this.onKeyClick(key));
  }
}
