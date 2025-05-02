const size = 10;
let gridData = Array(size).fill().map(() => Array(size).fill(''));
let currentQuestionIndex = 0;
let score = 0;
let path = [];
let mouseDown = false;
let placedAnswers = [];
let questions = [];

const directions = [
  [0, 1],   // horizontal right
  [1, 0]    // vertical down
];

const allQuestions = [
  { hint: "Capital of India", answer: "DELHI" },
  { hint: "Largest ocean", answer: "PACIFIC" },
  { hint: "Red planet", answer: "MARS" },
  { hint: "King of Jungle", answer: "LION" },
  { hint: "Used on blackboard", answer: "CHALK" },
  { hint: "Tallest mountain", answer: "EVEREST" },
  { hint: "Fastest land animal", answer: "CHEETAH" },
  { hint: "Yellow fruit", answer: "MANGO" },
  { hint: "Computer brain", answer: "CPU" },
  { hint: "Coldest continent", answer: "ANTARCTICA" },
  { hint: "Shape with 3 sides", answer: "TRIANGLE" },
  { hint: "Smallest prime", answer: "TWO" },
  { hint: "Opposite of day", answer: "NIGHT" },
  { hint: "Green vegetable", answer: "SPINACH" },
  { hint: "Planet with rings", answer: "SATURN" },
  { hint: "India's currency", answer: "RUPEE" },
  { hint: "Type of dance", answer: "SALSA" },
  { hint: "Pet that barks", answer: "DOG" },
  { hint: "Used to cut", answer: "SCISSORS" },
  { hint: "Frozen water", answer: "ICE" }
];

function getRandomQuestions(pool, count) {
  const shuffled = pool.sort(() => 0.5 - Math.random());
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
      placedAnswers.push(word);
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

      // Mouse events
      cell.addEventListener("mousedown", (e) => {
        e.preventDefault();
        mouseDown = true;
        path = [cell];
        cell.classList.add("selected");
      });

      cell.addEventListener("mouseover", () => {
        if (mouseDown && !path.includes(cell)) {
          path.push(cell);
          cell.classList.add("selected");
        }
      });

      cell.addEventListener("mouseup", () => {
        if (mouseDown) {
          checkWord();
          mouseDown = false;
          path.forEach(c => c.classList.remove("selected"));
          path = [];
        }
      });

      // Touch events
      cell.addEventListener("touchstart", (e) => {
        e.preventDefault();
        mouseDown = true;
        const target = document.elementFromPoint(e.touches[0].clientX, e.touches[0].clientY);
        if (target && target.classList.contains("cell")) {
          path = [target];
          target.classList.add("selected");
        }
      });

      cell.addEventListener("touchmove", (e) => {
        const target = document.elementFromPoint(e.touches[0].clientX, e.touches[0].clientY);
        if (mouseDown && target && target.classList.contains("cell") && !path.includes(target)) {
          path.push(target);
          target.classList.add("selected");
        }
      });

      cell.addEventListener("touchend", () => {
        if (mouseDown) {
          checkWord();
          mouseDown = false;
          path.forEach(c => c.classList.remove("selected"));
          path = [];
        }
      });

      grid.appendChild(cell);
    }
  }
}

function checkWord() {
  const word = path.map(c => c.innerText).join('');
  const correctAnswer = questions[currentQuestionIndex].answer;

  if (word === correctAnswer) {
    path.forEach(c => c.classList.add("found"));
    questions[currentQuestionIndex].revealed = true; // mark as revealed
    score++;
    currentQuestionIndex++;
    updateQuestion();
    resultBox.innerText = "";
  } else {
    resultBox.innerText = `❌ Incorrect! Try again.`;
    setTimeout(() => {
      resultBox.innerText = "";
    }, 1000);
  }
}


function updateQuestion() {
  const questionBox = document.getElementById("questionBox");
  if (currentQuestionIndex < questions.length) {
    const current = questions[currentQuestionIndex];
    const blanks = current.revealed ? current.answer.split('').join(' ') : "_ ".repeat(current.answer.length).trim();
    questionBox.innerText = `Q${currentQuestionIndex + 1}: ${current.hint} | ${blanks}`;
  } else {
    questionBox.innerText = `🎉 Congratulations! You scored ${score}/${questions.length}`;
    document.getElementById("playAgainBtn").style.display = "inline-block";
  }
}


function initGame() {
  fillGridRandomLetters();
  drawGrid();
  updateQuestion();
}

function restartGame() {
  currentQuestionIndex = 0;
  score = 0;
  resultBox.innerText = "";
  document.getElementById("playAgainBtn").style.display = "none";

  questions = [];
  gridData = Array(size).fill().map(() => Array(size).fill(''));
  placedAnswers = [];

  const shuffled = getRandomQuestions(allQuestions, allQuestions.length);
  for (let q of shuffled) {
    if (questions.length < 5 && placeWord(q.answer)) {
      questions.push({ ...q, revealed: false }); // add revealed property
    }
  }

  if (questions.length < 5) {
    restartGame();
    return;
  }

  initGame();
}

const resultBox = document.getElementById("resultBox");
document.addEventListener("mouseup", () => (mouseDown = false));
document.addEventListener("touchend", () => (mouseDown = false));

restartGame();
