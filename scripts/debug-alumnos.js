const fetch = globalThis.fetch || require('node-fetch');

async function run() {
  const loginRes = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@aprentic.test', password: 'Admin1234!' })
  });
  const login = await loginRes.json();
  console.log('LOGIN', loginRes.status, login);

  const token = login.token;
  const promosRes = await fetch('http://localhost:3000/api/promociones?limit=1&sort=codigo', {
    headers: { Authorization: `Bearer ${token}` }
  });
  const promos = await promosRes.json();
  console.log('PROMOS', promosRes.status, promos);

  const promoId = promos.items?.[0]?._id;
  console.log('PROMO_ID', promoId);

  const createRes = await fetch('http://localhost:3000/api/alumnos', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre: 'Test', apellidos: 'Alumno', email: `test.alumno.${Date.now()}@aprentic.test`, promocion: promoId })
  });
  const createBody = await createRes.json();
  console.log('CREATE', createRes.status, createBody);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});