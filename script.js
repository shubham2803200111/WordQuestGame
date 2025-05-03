const size = 6;
let gridData = Array(size).fill().map(() => Array(size).fill(''));
let currentQuestionIndex = 0;
let score = 0;
let path = [];
let mouseDown = false;
let placedAnswers = [];
let questions = [];

const directions = [
  [0, 1],     // left to right
  [1, 0]      // top to bottom
];

const allQuestions = [
  { hint: "Capital of India", answer: "DELHI" },
  { hint: "Red planet", answer: "MARS" },
  { hint: "King of Jungle", answer: "LION" },
  { hint: "Used on blackboard", answer: "CHALK" },
  { hint: "Sweet fruit", answer: "MANGO" },
  { hint: "Computer brain", answer: "CPU" },
  { hint: "Smallest prime", answer: "TWO" },
  { hint: "Opposite of day", answer: "NIGHT" },
  { hint: "Green vegetable", answer: "PEAS" },
  { hint: "Pet that barks", answer: "DOG" },
  { hint: "Used to cut", answer: "BLADE" },
  { hint: "Frozen water", answer: "ICE" },
  { hint: "Star we see daily", answer: "SUN" },
  { hint: "Rain protector", answer: "COAT" },
  { hint: "Holiest river in India", answer: "GANGA" },
  { hint: "Baby cat", answer: "KITTEN" },
  { hint: "Lives in water", answer: "FISH" },
  { hint: "Flying mammal", answer: "BAT" },
  { hint: "Has four wheels", answer: "CAR" },
  { hint: "Opposite of cold", answer: "HOT" }
];

function getRandomQuestions(pool, count) {
  const shuffled = [...pool].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function placeWord(word) {
  for (let attempts = 0; attempts < 100; attempts++) {
    const dir = directions[Math.floor(Math.random() * directions.length)];
    const row = Math.floor(Math.random() * size);
    const col = Math.floor(Math.random() * size);

    let r = row, c = col;
    let fits = true;

    for (let i = 0; i < word.length; i++) {
      if (r < 0 || r >= size || c < 0 || c >= size || (gridData[r][c] && gridData[r][c] !== word[i])) {
        fits = false;
        break;
      }
      r += dir[0];
      c += dir[1];
    }

    if (fits) {
      r = row;
      c = col;
      for (let i = 0; i < word.length; i++) {
        gridData[r][c] = word[i];
        r += dir[0];
        c += dir[1];
      }
      placedAnswers.push({ word, row, col, dir });
      return true;
    }
  }
  return false;
}

function fillGridRandomLetters() {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (!gridData[r][c]) {
        gridData[r][c] = letters[Math.floor(Math.random() * letters.length)];
      }
    }
  }
}

function drawGrid() {
  const grid = document.getElementById("grid");
  grid.innerHTML = "";
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      cell.innerText = gridData[r][c];
      cell.dataset.row = r;
      cell.dataset.col = c;

      const handleSelect = () => {
        if (!path.includes(cell)) {
          path.push(cell);
          cell.classList.add("selected");
        }
      };

      cell.addEventListener("mousedown", () => {
        mouseDown = true;
        path = [cell];
        cell.classList.add("selected");
      });

      cell.addEventListener("mouseover", () => {
        if (mouseDown) handleSelect();
      });

      cell.addEventListener("touchstart", (e) => {
        e.preventDefault();
        mouseDown = true;
        path = [cell];
        cell.classList.add("selected");
      });

      cell.addEventListener("touchmove", (e) => {
        const touch = e.touches[0];
        const el = document.elementFromPoint(touch.clientX, touch.clientY);
        if (el && el.classList.contains("cell") && !path.includes(el)) {
          path.push(el);
          el.classList.add("selected");
        }
      });

      cell.addEventListener("mouseup", finishSelection);
      cell.addEventListener("touchend", finishSelection);

      grid.appendChild(cell);
    }
  }
}

function finishSelection() {
  if (mouseDown) {
    checkWord();
    mouseDown = false;
    path.forEach(c => c.classList.remove("selected"));
    path = [];
  }
}

function checkWord() {
  const word = path.map(c => c.innerText).join('');
  const correctAnswer = questions[currentQuestionIndex].answer;

  if (word === correctAnswer) {
    path.forEach(c => c.classList.add("found"));
    score++;
    currentQuestionIndex++;
    updateQuestion();
    resultBox.innerText = "";
  } else {
    resultBox.innerText = `❌ Incorrect! Try again.`;
    setTimeout(() => resultBox.innerText = "", 1000);
  }
}

function updateQuestion() {
  const questionBox = document.getElementById("questionBox");
  const blanks = document.getElementById("answerBlanks");
  if (currentQuestionIndex < questions.length) {
    const q = questions[currentQuestionIndex];
    questionBox.innerText = `Q${currentQuestionIndex + 1}: ${q.hint}`;
    blanks.innerText = "_ ".repeat(q.answer.length).trim();
  } else {
    questionBox.innerText = `🎉 Congratulations! You scored ${score}/${questions.length}`;
    document.getElementById("playAgainBtn").style.display = "inline-block";
    document.getElementById("hintBtn").style.display = "none";
    document.getElementById("answerBlanks").innerText = "";
  }
}

function restartGame() {
  currentQuestionIndex = 0;
  score = 0;
  resultBox.innerText = "";
  document.getElementById("playAgainBtn").style.display = "none";
  document.getElementById("hintBtn").style.display = "inline-block";
  document.getElementById("answerBlanks").innerText = "";

  questions = [];
  gridData = Array(size).fill().map(() => Array(size).fill(''));
  placedAnswers = [];

  const shuffled = getRandomQuestions(allQuestions, allQuestions.length);
  for (let q of shuffled) {
    if (questions.length < 5 && placeWord(q.answer)) {
      questions.push(q);
    }
  }

  if (questions.length < 5) {
    restartGame();
    return;
  }

  fillGridRandomLetters();
  drawGrid();
  updateQuestion();
}

function showHint() {
  const answer = questions[currentQuestionIndex].answer;
  const data = placedAnswers.find(p => p.word === answer);
  if (!data) return;

  let r = data.row, c = data.col;
  for (let i = 0; i < answer.length; i++) {
    const cell = document.querySelector(`.cell[data-row='${r}'][data-col='${c}']`);
    if (cell) {
      cell.classList.add("hint-blink");
      setTimeout(() => cell.classList.remove("hint-blink"), 1000);
    }
    r += data.dir[0];
    c += data.dir[1];
  }
}

const resultBox = document.getElementById("resultBox");
document.getElementById("hintBtn").addEventListener("click", showHint);
document.addEventListener("mouseup", () => (mouseDown = false));
restartGame();
