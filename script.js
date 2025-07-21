let questions = [];
fetch('data/questions.json')
.then(res => res.json())
.then(data => { questions = data; init(); });

let idx = 0, score = 0;
const flagged = new Set();

function init() {
showQuestion();
document.getElementById('next').onclick = () => navigate(1);
document.getElementById('prev').onclick = () => navigate(-1);
document.getElementById('flag').onclick = toggleFlag;
}

function showQuestion() {
const q = questions[idx];
document.getElementById('area-title').textContent = q.area;
document.getElementById('question-text').textContent = ${idx+1}. ${q.question};
const opts = document.getElementById('options'); opts.innerHTML = '';
q.options.forEach(o => {
const li = document.createElement('li');
const btn = document.createElement('button');
btn.textContent = o;
btn.onclick = () => selectAnswer(o[0]);
li.appendChild(btn);
opts.appendChild(li);
});
document.getElementById('feedback').textContent = '';
}

function selectAnswer(choice) {
const q = questions[idx];
const correct = q.correct;
if (!q.answered) {
q.answered = choice;
if (choice === correct) score++;
}
document.getElementById('feedback').textContent = Resposta correta: ${correct};
}

function navigate(step) {
idx += step;
if (idx < 0) idx = 0;
if (idx >= questions.length) return showResults();
showQuestion();
}

function toggleFlag() {
if (flagged.has(idx)) flagged.delete(idx);
else flagged.add(idx);
}

function showResults() {
document.querySelector('main').classList.add('hidden');
document.querySelector('nav').classList.add('hidden');
document.getElementById('results').classList.remove('hidden');
document.getElementById('score').textContent = Você acertou ${score} de ${questions.length};
const ex = document.getElementById('explanations');
questions.forEach((q,i) => {
const div = document.createElement('div');
div.innerHTML = <strong>${i+1}. ${q.answered === q.correct ? 'Correta' : 'Errada'}</strong>: ${q.explanation};
ex.appendChild(div);
});
}