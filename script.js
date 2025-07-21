let questions = [];
let idx = 0;
let score = 0;
const flagged = new Set();

async function loadQuestions() {
  const res = await fetch("questions.json");
  questions = await res.json();
  init();
}

function init() {
  showQuestion();
  document.getElementById('next').onclick = () => navigate(1);
  document.getElementById('prev').onclick = () => navigate(-1);
  document.getElementById('flag').onclick = toggleFlag;
  updateButtons();
}

function showQuestion() {
  const q = questions[idx];
  document.getElementById('area-title').textContent = q.area;
  document.getElementById('question-text').textContent = `${q.numero}. ${q.question}`;

  const opts = document.getElementById('options');
  opts.innerHTML = '';

  for (const key in q.options) {
    const li = document.createElement('li');
    const label = document.createElement('label');
    label.className = 'option-label';

    if (q.answered) {
      if (key === q.correct) label.classList.add('correct');
      else if (key === q.answered) label.classList.add('wrong');
    }

    const input = document.createElement('input');
    input.type = 'radio';
    input.name = 'option';
    input.disabled = !!q.answered;
    input.checked = q.answered === key;
    input.onclick = () => selectAnswer(key);

    const span = document.createElement('span');
    span.textContent = `${key}) ${q.options[key]}`;

    label.appendChild(input);
    label.appendChild(span);
    li.appendChild(label);
    opts.appendChild(li);
  }

  const feedback = document.getElementById('feedback');
  if (q.answered) {
    feedback.textContent = q.answered === q.correct
      ? 'Resposta correta!'
      : `Errado. A resposta correta é: ${q.correct}) ${q.options[q.correct]}`;
    feedback.style.color = q.answered === q.correct ? 'green' : 'red';
  } else {
    feedback.textContent = '';
  }

  updateButtons();
  updateFlagButton();
}

function selectAnswer(choice) {
  const q = questions[idx];
  if (!q.answered) {
    q.answered = choice;
    if (choice === q.correct) score++;
  }
  showQuestion();
}

function navigate(step) {
  idx += step;
  if (idx < 0) idx = 0;
  if (idx >= questions.length) {
    showResults();
    return;
  }
  showQuestion();
}

function toggleFlag() {
  if (flagged.has(idx)) {
    flagged.delete(idx);
    alert(`Questão ${idx + 1} desmarcada.`);
  } else {
    flagged.add(idx);
    alert(`Questão ${idx + 1} marcada.`);
  }
  updateFlagButton();
}

function updateButtons() {
  document.getElementById('prev').disabled = idx === 0;
  document.getElementById('next').textContent = idx === questions.length - 1 ? 'Finalizar' : 'Próxima';
}

function updateFlagButton() {
  const flagBtn = document.getElementById('flag');
  const flagIcon = document.getElementById('flag-icon');
  const isFlagged = flagged.has(idx);
  flagBtn.textContent = isFlagged ? 'Desmarcar' : 'Marcar questão';
  flagIcon.classList.toggle('flagged', isFlagged);
}

function showResults() {
  document.querySelector('main').style.display = 'none';
  document.querySelector('nav').style.display = 'none';

  const results = document.getElementById('results');
  results.style.display = 'block';

  const pct = Math.round((score / questions.length) * 100);
  document.getElementById('score').textContent = `Você acertou ${score} de ${questions.length} questões (${pct}%).`;

  const ex = document.getElementById('explanations');
  ex.innerHTML = '';
  questions.forEach((q, i) => {
    const div = document.createElement('div');
    const acertou = q.answered === q.correct;
    const foiMarcada = flagged.has(i);
    div.innerHTML = `<strong>${q.numero}. ${acertou ? 'Correta' : 'Errada'}</strong> - Sua resposta: ${q.answered || '-'}; Correta: ${q.correct}. ${foiMarcada ? '⚑ Questão marcada' : ''}<br>Explicação: ${q.explanation}`;
    div.style.color = acertou ? 'green' : 'red';
    ex.appendChild(div);
  });
}

loadQuestions();
