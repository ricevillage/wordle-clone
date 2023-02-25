import { Wordle } from "./Wordle.js";
const restartBtn = document.querySelector("#restartButton");

let WordleGame = new Wordle();
WordleGame.initGame();

restartBtn.addEventListener("click", restartGame);

function restartGame() {
  cleanupGame();
  WordleGame = new Wordle();
  WordleGame.initGame();
}

function cleanupGame() {
  const boardDiv = document.querySelector("#board");
  const keyboardDiv = document.querySelector("#keyboard");
  const overlayDiv = document.querySelector("#overlay");
  removeChildElements(boardDiv);
  removeChildElements(keyboardDiv);
  overlayDiv.style.display = "none";
}

function removeChildElements(parent) {
  while (parent.firstChild) {
    parent.removeChild(parent.lastChild);
  }
}
