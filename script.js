const welcomeScreen = document.getElementById('welcome-screen');
const authScreen = document.getElementById('auth-screen');
const btnLogin = document.getElementById('btn-login');
const btnRegister = document.getElementById('btn-register');

btnLogin.onclick = () => {
  welcomeScreen.style.display = 'none';
  authScreen.style.display = 'block';
  showLoginForm();
};

btnRegister.onclick = () => {
  welcomeScreen.style.display = 'none';
  authScreen.style.display = 'block';
  showRegisterForm();
};

function showLoginForm() {
  document.getElementById('login-form').style.display = 'block';
  document.getElementById('register-form').style.display = 'none';
  document.getElementById('form-title').innerText = 'Авторизация';
  document.querySelector('.toggle').innerText = 'Нет аккаунта? Зарегистрироваться';
}

function showRegisterForm() {
  document.getElementById('login-form').style.display = 'none';
  document.getElementById('register-form').style.display = 'block';
  document.getElementById('form-title').innerText = 'Регистрация';
  document.querySelector('.toggle').innerText = 'Уже есть аккаунт? Войти';
}

function toggleForms() {
  if (document.getElementById('login-form').style.display === 'none') {
    showLoginForm();
  } else {
    showRegisterForm();
  }
}

async function login() {
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();
  if (res.ok) {
    localStorage.setItem('token', data.token);
    window.location.href = '/tours.html';
  } else {
    alert(data.message || 'Ошибка входа');
  }
}

async function register() {
  const body = {
    first_name: document.getElementById('reg-first').value,
    last_name: document.getElementById('reg-last').value,
    email: document.getElementById('reg-email').value,
    password: document.getElementById('reg-pass').value,
    phone: document.getElementById('reg-phone').value
  };

  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  const data = await res.json();
  if (res.ok) {
    alert('Регистрация успешна. Теперь войдите.');
    showLoginForm();
  } else {
    alert(data.message || 'Ошибка регистрации');
  }
}