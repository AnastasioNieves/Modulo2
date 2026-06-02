const demoUsers = {
  admin: {
    email: 'admin@aprentic.test',
    password: 'Admin1234!'
  },
  profesor: {
    email: 'ana.profesor@aprentic.test',
    password: 'Profesor1234!'
  },
  alumno: {
    email: 'lucia.alumna@aprentic.test',
    password: 'Alumno1234!'
  }
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

const elements = {
  form: $('#loginForm'),
  email: $('#email'),
  password: $('#password'),
  message: $('#loginMessage'),
  apiStatus: $('#apiStatus'),
  submitBtn: $('#submitBtn')
};

function safeStorageGet(key) {
  try {
    return localStorage.getItem(key);
  } catch (err) {
    return null;
  }
}

function safeStorageSet(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch (err) {
    throw new Error('No se pudo guardar la sesion en este navegador');
  }
}

function setMessage(message, type = '') {
  elements.message.textContent = message || '';
  elements.message.className = `message ${type}`.trim();
}

async function api(path, options = {}) {
  const headers = {
    ...(options.headers || {})
  };

  if (options.body) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(path, {
    ...options,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json') ? await response.json() : null;

  if (!response.ok) {
    const error = new Error(payload?.message || `HTTP ${response.status}`);
    error.status = response.status;
    throw error;
  }

  return payload;
}

async function checkHealth() {
  try {
    await api('/health');
    elements.apiStatus.textContent = 'API ok';
    elements.apiStatus.className = 'status-pill ok';
  } catch (err) {
    elements.apiStatus.textContent = 'API offline';
    elements.apiStatus.className = 'status-pill error';
  }
}

async function login(email, password) {
  setMessage('');
  elements.submitBtn.disabled = true;
  elements.submitBtn.textContent = 'Entrando...';

  try {
    const data = await api('/api/auth/login', {
      method: 'POST',
      body: { email, password }
    });

    safeStorageSet('aprenticToken', data.token);
    safeStorageSet('aprenticUser', JSON.stringify(data.user));
    window.location.href = '/';
  } catch (err) {
    setMessage(`${err.message}. Comprueba que el backend esta levantado y que ejecutaste el seed.`, 'error');
  } finally {
    elements.submitBtn.disabled = false;
    elements.submitBtn.textContent = 'Entrar al panel';
  }
}

function bindEvents() {
  elements.form.addEventListener('submit', (event) => {
    event.preventDefault();
    login(elements.email.value, elements.password.value);
  });

  $$('[data-login]').forEach((button) => {
    button.addEventListener('click', () => {
      const user = demoUsers[button.dataset.login];
      elements.email.value = user.email;
      elements.password.value = user.password;
      login(user.email, user.password);
    });
  });
}

function boot() {
  if (window.location.search) {
    window.history.replaceState({}, document.title, '/login');
  }

  if (safeStorageGet('aprenticToken')) {
    window.location.replace('/');
    return;
  }

  bindEvents();
  checkHealth();
}

boot();
