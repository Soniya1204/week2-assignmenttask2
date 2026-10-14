let isLogin = true;

const formTitle = document.getElementById('form-title');
const formSubtitle = document.getElementById('form-subtitle');
const submitBtn = document.getElementById('submit-btn');
const toggleBtn = document.getElementById('toggle-btn');
const toggleText = document.getElementById('toggle-text');
const usernameGroup = document.getElementById('username-group');
const usernameInput = document.getElementById('username');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const msgDiv = document.getElementById('msg');

toggleBtn.addEventListener('click', () => {
  isLogin = !isLogin;
  formTitle.innerText = isLogin ? 'Welcome Back' : 'Create Account';
  formSubtitle.innerText = isLogin 
    ? 'Enter your credentials to access your account' 
    : 'Fill in your details to register a new account';
  submitBtn.innerText = isLogin ? 'Sign In' : 'Register';
  toggleText.innerText = isLogin ? "Don't have an account?" : 'Already have an account?';
  toggleBtn.innerText = isLogin ? 'Create an account' : 'Sign In';
  
  usernameGroup.style.display = isLogin ? 'none' : 'block';
  usernameInput.required = !isLogin;
  msgDiv.className = 'alert-msg';
  msgDiv.innerText = '';
});

document.getElementById('auth-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  msgDiv.className = 'alert-msg';
  msgDiv.innerText = '';

  const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
  const body = isLogin
    ? { email: emailInput.value, password: passwordInput.value }
    : { username: usernameInput.value, email: emailInput.value, password: passwordInput.value };

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (data.success) {
      window.location.href = '/dashboard.html';
    } else {
      msgDiv.classList.add('alert-error');
      msgDiv.innerText = data.message || 'Authentication error';
    }
  } catch (err) {
    msgDiv.classList.add('alert-error');
    msgDiv.innerText = 'Server error. Please try again.';
  }
});