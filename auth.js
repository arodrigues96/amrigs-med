const CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID';

function decodeJwtResponse(token) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split('')
      .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  );
  return JSON.parse(jsonPayload);
}

function handleCredentialResponse(response) {
  const data = decodeJwtResponse(response.credential);
  const user = {
    name: data.name,
    email: data.email,
    picture: data.picture,
  };
  localStorage.setItem('user', JSON.stringify(user));
  updateAuthUI();
}

function getUser() {
  try {
    return JSON.parse(localStorage.getItem('user'));
  } catch {
    return null;
  }
}

function initGoogle() {
  if (!window.google || !google.accounts || !google.accounts.id) return;
  google.accounts.id.initialize({
    client_id: CLIENT_ID,
    callback: handleCredentialResponse,
  });
  updateAuthUI();
}

function updateAuthUI() {
  const user = getUser();
  const container = document.getElementById('signin-container');
  const historyLink = document.getElementById('history-link');
  if (historyLink) historyLink.style.display = user ? 'block' : 'none';
  if (!container) return;

  if (user) {
    container.innerHTML = `<img src="${user.picture}" alt="${user.name}" style="width:32px;border-radius:50%;margin-right:8px;"> <span>${user.name}</span> <button id="signout">Sair</button>`;
    const btn = document.getElementById('signout');
    btn.onclick = () => {
      if (window.google && google.accounts && google.accounts.id) {
        google.accounts.id.disableAutoSelect();
      }
      localStorage.removeItem('user');
      updateAuthUI();
    };
  } else {
    container.innerHTML = '';
    if (window.google && google.accounts && google.accounts.id) {
      google.accounts.id.renderButton(container, { theme: 'outline', size: 'large' });
    } else {
      container.textContent = 'Carregando...';
    }
  }
}

function saveAttempt(qNum, area, selected, correct) {
  const user = getUser();
  if (!user) return;
  const key = `history_${user.email}`;
  const history = JSON.parse(localStorage.getItem(key)) || [];
  history.push({
    timestamp: new Date().toISOString(),
    qNum,
    area,
    selected,
    correct,
  });
  localStorage.setItem(key, JSON.stringify(history));
}

function getHistory() {
  const user = getUser();
  if (!user) return [];
  const key = `history_${user.email}`;
  return JSON.parse(localStorage.getItem(key)) || [];
}

document.addEventListener('DOMContentLoaded', () => {
  if (typeof window.checkAnswer === 'function') {
    const original = window.checkAnswer;
    window.checkAnswer = function (selected) {
      original(selected);
      try {
        const filtered =
          window.currentArea === 'all'
            ? window.questions
            : window.questions.filter(q => q.area === window.currentArea);
        const q = filtered[window.idx];
        saveAttempt(q.numero, q.area, selected, selected === q.correct);
      } catch (e) {
        console.error('Erro ao salvar tentativa', e);
      }
    };
  }
  updateAuthUI();
});

