const authService = require('../services/auth.service');

async function register(req, res) {
  const result = await authService.register(req.body);
  res.status(201).json(result);
}

async function login(req, res) {
  const result = await authService.login(req.body.email, req.body.password);

  if (req.is('application/x-www-form-urlencoded')) {
    return res.send(renderLoginRedirect(result));
  }

  res.json(result);
}

function me(req, res) {
  res.json({ user: req.user });
}

module.exports = {
  register,
  login,
  me
};

function renderLoginRedirect(result) {
  const token = safeScriptJson(result.token);
  const user = safeScriptJson(result.user);

  return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8">
    <title>Entrando...</title>
  </head>
  <body>
    <p>Entrando al panel...</p>
    <script>
      localStorage.setItem('aprenticToken', ${token});
      localStorage.setItem('aprenticUser', JSON.stringify(${user}));
      window.location.replace('/');
    </script>
  </body>
</html>`;
}

function safeScriptJson(value) {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}
