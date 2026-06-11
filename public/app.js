const state = {
  token: localStorage.getItem('aprenticToken') || '',
  user: JSON.parse(localStorage.getItem('aprenticUser') || 'null'),
  alumnos: [],
  proyectos: [],
  notas: [],
  promociones: [],
<<<<<<< HEAD
  selectedStudent: null,
  studentFormMode: 'create',
=======
  selectedAlumnoId: null,
  formMode: 'create',
>>>>>>> d753a4f9a03c7e5af622ca411e3ce34c98dc8fe5
  analytics: {
    campus: [],
    riesgo: [],
    ranking: []
  }
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

const elements = {
  logoutBtn: $('#logoutBtn'),
  refreshBtn: $('#refreshBtn'),
  apiStatus: $('#apiStatus'),
  roleBadge: $('#roleBadge'),
  toast: $('#toast'),
  studentSearch: $('#studentSearch'),
  permissionTestBtn: $('#permissionTestBtn'),
  permissionResult: $('#permissionResult'),
<<<<<<< HEAD
  actionsRow: $('#actionsRow'),
  btnEditStudent: $('#btnEditStudent'),
  btnCreateStudent: $('#btnCreateStudent'),
  btnDeleteStudent: $('#btnDeleteStudent'),
  studentFormContainer: $('#studentFormContainer'),
  studentForm: $('#studentForm'),
  studentFormTitle: $('#studentFormTitle'),
  studentFormSubmit: $('#studentFormSubmit'),
  studentFormCancel: $('#studentFormCancel'),
  studentFormError: $('#studentFormError'),
  studentNombre: $('#studentNombre'),
  studentApellidos: $('#studentApellidos'),
  studentEmail: $('#studentEmail'),
  studentPromocion: $('#studentPromocion'),
  studentEstado: $('#studentEstado'),
  studentsTable: $('#studentsTable')
=======
  createStudentBtn: $('#createStudentBtn'),
  editStudentBtn: $('#editStudentBtn'),
  deleteStudentBtn: $('#deleteStudentBtn'),
  studentSelectionLabel: $('#studentSelectionLabel'),
  studentActionsBar: $('.actions-bar'),
  studentFormPanel: $('#studentFormPanel'),
  studentForm: $('#studentForm'),
  studentFormTitle: $('#studentFormTitle'),
  studentNameInput: $('#studentNameInput'),
  studentLastNameInput: $('#studentLastNameInput'),
  studentEmailInput: $('#studentEmailInput'),
  studentPromocionInput: $('#studentPromocionInput'),
  studentEstadoInput: $('#studentEstadoInput'),
>>>>>>> d753a4f9a03c7e5af622ca411e3ce34c98dc8fe5
};

function requireSession() {
  if (!state.token || !state.user) {
    window.location.replace('/login');
    return false;
  }

  return true;
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.remove('hidden');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => {
    elements.toast.classList.add('hidden');
  }, 3200);
}

function setMessage(node, message, type = '') {
  node.textContent = message || '';
  node.className = `message ${type}`.trim();
}

function formatRole(role) {
  if (!role) return 'Sin sesion';
  return role.charAt(0).toUpperCase() + role.slice(1);
}

function clearSession() {
  state.token = '';
  state.user = null;
  localStorage.removeItem('aprenticToken');
  localStorage.removeItem('aprenticUser');
  window.location.replace('/login');
}

async function api(path, options = {}) {
  const headers = {
    ...(options.headers || {})
  };

  if (state.token) {
    headers.Authorization = `Bearer ${state.token}`;
  }

  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(path, {
    ...options,
    headers,
    body: options.body && !(options.body instanceof FormData) ? JSON.stringify(options.body) : options.body
  });

  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json') ? await response.json() : null;

  if (!response.ok) {
    const error = new Error(payload?.message || `HTTP ${response.status}`);
    error.status = response.status;
    error.payload = payload;
    error.details = payload?.details || null;
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

async function loadDashboard() {
  try {
<<<<<<< HEAD
    const [alumnos, proyectos, notas, promociones, campus, riesgo, ranking] = await Promise.all([
=======
    const [alumnos, proyectos, notas, campus, riesgo, ranking, promociones] = await Promise.all([
>>>>>>> d753a4f9a03c7e5af622ca411e3ce34c98dc8fe5
      api('/api/alumnos?limit=50&sort=apellidos').catch(emptyList),
      api('/api/proyectos?limit=50&sort=nombre').catch(emptyList),
      api('/api/notas?limit=50&sort=-updatedAt').catch(emptyList),
      api('/api/promociones?limit=50&sort=codigo').catch(emptyList),
      api('/api/analytics/tasa-aptos-campus').catch(emptyData),
      api('/api/analytics/alumnos-riesgo?threshold=60&minNoAptos=1').catch(emptyData),
      api('/api/analytics/ranking-proyectos-no-aptos?limit=5').catch(emptyData),
      api('/api/promociones?limit=50&sort=codigo').catch(emptyList)
    ]);

    state.alumnos = alumnos.items || [];
    state.proyectos = proyectos.items || [];
    state.notas = notas.items || [];
    state.promociones = promociones.items || [];
<<<<<<< HEAD
    updatePromocionOptions();
=======
>>>>>>> d753a4f9a03c7e5af622ca411e3ce34c98dc8fe5
    state.analytics.campus = campus.data || [];
    state.analytics.riesgo = riesgo.data || [];
    state.analytics.ranking = ranking.data || [];
    renderPromotionOptions();

    renderAll();
  } catch (err) {
    showToast(err.message);
    if (err.status === 401) {
      clearSession();
    }
  }
}

function emptyList() {
  return { items: [], pagination: { total: 0 } };
}

function emptyData() {
  return { data: [] };
}

function renderAll() {
  renderMetrics();
  renderCampusBars();
  renderRiskList();
  renderRanking();
  renderStudents();
  renderProjects();
  renderGrades();
}

function renderMetrics() {
  $('#metricAlumnos').textContent = state.alumnos.length;
  $('#metricProyectos').textContent = state.proyectos.length;
  $('#metricRiesgo').textContent = `${state.analytics.riesgo.length} en riesgo`;
  $('#metricNoAptos').textContent = `${state.analytics.ranking.reduce((sum, item) => sum + (item.noAptos || 0), 0)} no aptos`;

  const rates = state.analytics.campus.map((item) => Number(item.tasaAptos || 0));
  const average = rates.length ? rates.reduce((sum, rate) => sum + rate, 0) / rates.length : 0;
  $('#metricTasa').textContent = `${Math.round(average)}%`;
}

function renderCampusBars() {
  const root = $('#campusBars');
  if (!state.analytics.campus.length) {
    root.innerHTML = emptyState('Sin datos de campus');
    return;
  }

  root.innerHTML = state.analytics.campus
    .map((item) => {
      const rate = Number(item.tasaAptos || 0);
      return `
        <div class="bar-row">
          <div class="bar-top">
            <strong>${escapeHtml(item.campus)}</strong>
            <span>${rate}%</span>
          </div>
          <div class="bar-track"><div class="bar-fill" style="width: ${Math.max(2, rate)}%"></div></div>
        </div>
      `;
    })
    .join('');
}

function renderRiskList() {
  const root = $('#riskList');
  if (!state.analytics.riesgo.length) {
    root.innerHTML = emptyState('Sin alumnos en riesgo');
    return;
  }

  root.innerHTML = state.analytics.riesgo
    .map((item) => `
      <div class="list-item">
        <strong>${escapeHtml(item.nombre)} ${escapeHtml(item.apellidos)}</strong>
        <span>${escapeHtml(item.promocion)} - media ${item.media} - ${item.noAptos} no aptos</span>
      </div>
    `)
    .join('');
}

function renderRanking() {
  const root = $('#projectRanking');
  if (!state.analytics.ranking.length) {
    root.innerHTML = emptyState('Sin no aptos registrados');
    return;
  }

  root.innerHTML = state.analytics.ranking
    .map((item, index) => `
      <div class="ranking-row">
        <strong>${index + 1}. ${escapeHtml(item.proyecto)}</strong>
        <span>${escapeHtml(item.modulo)} - ${item.noAptos} no aptos - media ${item.mediaSuspensos}</span>
      </div>
    `)
    .join('');
}

function renderStudents() {
  const query = elements.studentSearch.value.trim().toLowerCase();
  const rows = state.alumnos.filter((alumno) => {
    const text = `${alumno.nombre} ${alumno.apellidos} ${alumno.email}`.toLowerCase();
    return text.includes(query);
  });

  elements.studentsTable.innerHTML = rows.length
    ? rows.map(studentRow).join('')
    : tableEmptyRow(5, 'No hay alumnos para mostrar');

<<<<<<< HEAD
  // Agregar event listeners a las filas
  $$('.student-row').forEach((row) => {
    row.addEventListener('click', () => {
      const studentId = row.dataset.studentId;
      state.selectedStudent = state.alumnos.find((a) => a._id === studentId) || null;
      renderStudents(); // Re-render para mostrar selección
      updateActionsVisibility();
    });
  });
=======
  updateStudentActions();
>>>>>>> d753a4f9a03c7e5af622ca411e3ce34c98dc8fe5
}

function studentRow(alumno) {
  const promocion = alumno.promocion || {};
  const campus = promocion.campus || {};
<<<<<<< HEAD
  const isSelected = state.selectedStudent?._id === alumno._id ? 'selected' : '';
  return `
    <tr class="student-row ${isSelected}" data-student-id="${alumno._id}">
=======
  const selected = alumno._id === state.selectedAlumnoId ? 'selected-row' : '';

  return `
    <tr data-id="${escapeHtml(alumno._id)}" class="${selected}">
>>>>>>> d753a4f9a03c7e5af622ca411e3ce34c98dc8fe5
      <td>
        <div class="student-name">
          <strong>${escapeHtml(alumno.nombre)} ${escapeHtml(alumno.apellidos)}</strong>
          <span>${escapeHtml(alumno._id)}</span>
        </div>
      </td>
      <td>${escapeHtml(alumno.email)}</td>
      <td>${escapeHtml(promocion.codigo || '-')}</td>
      <td>${escapeHtml(campus.nombre || '-')}</td>
      <td>${statusTag(alumno.estado || 'activo')}</td>
    </tr>
  `;
}

function updateStudentActions() {
  const isAdmin = state.user?.role === 'admin';
  elements.studentActionsBar.style.display = isAdmin ? 'flex' : 'none';

  if (!isAdmin) {
    elements.studentSelectionLabel.textContent = 'Solo admin puede crear, editar o eliminar alumnos.';
    return;
  }

  const selectedAlumno = state.alumnos.find((alumno) => alumno._id === state.selectedAlumnoId);
  const hasSelection = Boolean(selectedAlumno);

  if (!hasSelection) {
    state.selectedAlumnoId = null;
  }

  elements.editStudentBtn.disabled = !hasSelection;
  elements.deleteStudentBtn.disabled = !hasSelection;
  elements.studentSelectionLabel.textContent = hasSelection
    ? `Alumno seleccionado: ${selectedAlumno.nombre} ${selectedAlumno.apellidos}`
    : 'Selecciona un alumno para editar o eliminar';
}

function openStudentForm(id) {
  const alumno = id ? state.alumnos.find((item) => item._id === id) : null;
  state.formMode = id ? 'edit' : 'create';
  state.selectedAlumnoId = id || state.selectedAlumnoId;

  elements.studentFormTitle.textContent = id ? 'Editar alumno' : 'Crear alumno';
  elements.studentNameInput.value = alumno?.nombre || '';
  elements.studentLastNameInput.value = alumno?.apellidos || '';
  elements.studentEmailInput.value = alumno?.email || '';
  elements.studentPromocionInput.value = alumno?.promocion?._id || state.promociones[0]?._id || '';
  elements.studentEstadoInput.value = alumno?.estado || 'activo';
  elements.studentFormPanel.classList.remove('hidden');
  elements.studentNameInput.focus();
}

function closeStudentForm() {
  state.formMode = 'create';
  elements.studentFormPanel.classList.add('hidden');
  elements.studentForm.reset();
}

async function submitStudentForm(event) {
  event.preventDefault();

  const nombre = elements.studentNameInput.value.trim();
  const apellidos = elements.studentLastNameInput.value.trim();
  const email = elements.studentEmailInput.value.trim();
  const promocion = elements.studentPromocionInput.value;
  const estado = elements.studentEstadoInput.value;

  if (!nombre || !apellidos || !email || !promocion) {
    showToast('Completa nombre, apellidos, email y promocion.');
    return;
  }

  const body = {
    nombre,
    apellidos,
    email,
    promocion,
    estado
  };

  try {
    if (state.formMode === 'edit') {
      await api(`/api/alumnos/${encodeURIComponent(state.selectedAlumnoId)}`, {
        method: 'PUT',
        body
      });
      showToast('Alumno actualizado correctamente');
    } else {
      await api('/api/alumnos', {
        method: 'POST',
        body
      });
      showToast('Alumno creado correctamente');
    }

    closeStudentForm();
    await loadDashboard();
  } catch (err) {
    showToast(err.message);
  }
}

function renderPromotionOptions() {
  const options = state.promociones.map((promocion) => {
    const label = `${promocion.codigo}${promocion.nombre ? ` — ${promocion.nombre}` : ''}`;
    return `<option value="${escapeHtml(promocion._id)}">${escapeHtml(label)}</option>`;
  }).join('');

  elements.studentPromocionInput.innerHTML = `
    <option value="">Selecciona una promocion</option>
    ${options}
  `;
}

function createStudent() {
  openStudentForm();
}

function editStudent() {
  if (!state.selectedAlumnoId) {
    showToast('Selecciona un alumno para editar');
    return;
  }

  openStudentForm(state.selectedAlumnoId);
}

async function deleteStudent(id) {
  if (!id) {
    showToast('Selecciona un alumno para eliminar');
    return;
  }

  const confirmed = confirm('¿Seguro que quieres eliminar este alumno?');
  if (!confirmed) return;

  try {
    await api(`/api/alumnos/${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });
    state.selectedAlumnoId = null;
    await loadDashboard();
    showToast('Alumno eliminado correctamente');
  } catch (err) {
    showToast(err.message);
  }
}

function handleStudentTableClick(event) {
  const row = event.target.closest('tr[data-id]');
  if (!row) return;

  const id = row.dataset.id;
  state.selectedAlumnoId = state.selectedAlumnoId === id ? null : id;
  renderStudents();
}

function renderProjects() {
  $('#projectsTable').innerHTML = state.proyectos.length
    ? state.proyectos.map(projectRow).join('')
    : tableEmptyRow(4, 'No hay proyectos para mostrar');
}

function projectRow(proyecto) {
  const promocion = proyecto.promocion || {};
  const profesor = proyecto.profesor || {};
  return `
    <tr>
      <td>
        <div class="project-name">
          <strong>${escapeHtml(proyecto.nombre)}</strong>
          <span>${escapeHtml(proyecto.descripcion || 'Sin descripcion')}</span>
        </div>
      </td>
      <td>${escapeHtml(proyecto.modulo)}</td>
      <td>${escapeHtml(promocion.codigo || '-')}</td>
      <td>${escapeHtml(`${profesor.nombre || ''} ${profesor.apellidos || ''}`.trim() || '-')}</td>
    </tr>
  `;
}

function renderGrades() {
  $('#gradesTable').innerHTML = state.notas.length
    ? state.notas.map(gradeRow).join('')
    : tableEmptyRow(6, 'No hay notas para mostrar');

  $$('.score-action').forEach((button) => {
    button.addEventListener('click', () => updateGrade(button.dataset.id));
  });
}

function gradeRow(nota) {
  const alumno = nota.alumno || {};
  const proyecto = nota.proyecto || {};
  const profesor = nota.profesor || {};
  const canEdit = state.user?.role === 'admin' || state.user?.role === 'profesor';
  return `
    <tr>
      <td>${escapeHtml(`${alumno.nombre || ''} ${alumno.apellidos || ''}`.trim() || '-')}</td>
      <td>${escapeHtml(proyecto.nombre || '-')}</td>
      <td>${escapeHtml(`${profesor.nombre || ''} ${profesor.apellidos || ''}`.trim() || '-')}</td>
      <td>
        <div class="score-control">
          <input id="score-${nota._id}" type="number" min="0" max="100" value="${Number(nota.score || 0)}" ${canEdit ? '' : 'disabled'}>
        </div>
      </td>
      <td>${nota.apto ? statusTag('apto') : statusTag('no apto')}</td>
      <td>${canEdit ? `<button class="score-action" type="button" data-id="${nota._id}">Guardar</button>` : '<span class="muted">Lectura</span>'}</td>
    </tr>
  `;
}

async function updateGrade(id) {
  const input = $(`#score-${CSS.escape(id)}`);
  const score = Number(input.value);

  if (Number.isNaN(score) || score < 0 || score > 100) {
    showToast('La nota debe estar entre 0 y 100');
    return;
  }

  try {
    await api(`/api/notas/${id}`, {
      method: 'PUT',
      body: { score }
    });
    await loadDashboard();
    showToast('Nota actualizada');
  } catch (err) {
    showToast(err.message);
  }
}

async function runPermissionTest() {
  const firstStudent = state.alumnos[0];
  setMessage(elements.permissionResult, '');

  if (!firstStudent) {
    setMessage(elements.permissionResult, 'No hay alumnos cargados para probar.', 'error');
    return;
  }

  try {
    await api(`/api/alumnos/${firstStudent._id}`, { method: 'DELETE' });
    setMessage(elements.permissionResult, 'Borrado permitido. Esto solo deberia ocurrir con admin.', 'ok');
    await loadDashboard();
  } catch (err) {
    const ok = err.status === 403;
    setMessage(
      elements.permissionResult,
      ok ? 'Permiso denegado correctamente para este rol.' : err.message,
      ok ? 'ok' : 'error'
    );
  }
}

function updateActionsVisibility() {
  const isAdmin = state.user?.role === 'admin';
  const hasSelection = !!state.selectedStudent;

  if (isAdmin) {
    elements.actionsRow.classList.remove('hidden');
  } else {
    elements.actionsRow.classList.add('hidden');
    hideStudentForm();
  }

  elements.btnEditStudent.disabled = !hasSelection;
  elements.btnDeleteStudent.disabled = !hasSelection;
}

function updatePromocionOptions() {
  if (!elements.studentPromocion) return;

  const options = [
    '<option value="">Selecciona promocion</option>',
    ...state.promociones.map((promocion) => `
      <option value="${escapeHtml(promocion._id)}">${escapeHtml(promocion.codigo || promocion.nombre || promocion._id)}</option>`)
  ];

  elements.studentPromocion.innerHTML = options.join('');
}

function showStudentForm(mode = 'create') {
  state.studentFormMode = mode;
  elements.studentFormTitle.textContent = mode === 'edit' ? 'Editar alumno' : 'Crear alumno';
  elements.studentFormSubmit.textContent = mode === 'edit' ? 'Actualizar alumno' : 'Crear alumno';
  elements.studentFormContainer.classList.remove('hidden');
  displayStudentFormError('');
  updatePromocionOptions();

  if (mode === 'edit' && state.selectedStudent) {
    elements.studentNombre.value = state.selectedStudent.nombre || '';
    elements.studentApellidos.value = state.selectedStudent.apellidos || '';
    elements.studentEmail.value = state.selectedStudent.email || '';
    elements.studentPromocion.value = state.selectedStudent.promocion?._id || state.selectedStudent.promocion || '';
    elements.studentEstado.value = state.selectedStudent.estado || 'activo';
  } else {
    elements.studentForm.reset();
    elements.studentEstado.value = 'activo';
  }
}

function hideStudentForm() {
  elements.studentFormContainer.classList.add('hidden');
  elements.studentForm.reset();
  displayStudentFormError('');
  state.studentFormMode = 'create';
}

function displayStudentFormError(message = '') {
  elements.studentFormError.textContent = message;
}

function normalizeInput(value) {
  return String(value || '').trim();
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

async function createAlumno() {
  if (!state.promociones.length) {
    showToast('No hay promociones disponibles para crear alumno.');
    return;
  }

  showStudentForm('create');
}

async function editAlumno() {
  if (!state.selectedStudent) {
    showToast('Por favor selecciona un alumno');
    return;
  }

  showStudentForm('edit');
}

async function submitStudentForm(event) {
  event.preventDefault();

  const nombre = normalizeInput(elements.studentNombre.value);
  const apellidos = normalizeInput(elements.studentApellidos.value);
  const email = normalizeInput(elements.studentEmail.value);
  const promocion = elements.studentPromocion.value;
  const estado = elements.studentEstado.value;

  if (!nombre) {
    displayStudentFormError('Nombre es obligatorio.');
    return;
  }

  if (!apellidos) {
    displayStudentFormError('Apellidos son obligatorios.');
    return;
  }

  if (!email || !isValidEmail(email)) {
    displayStudentFormError('Email invalido.');
    return;
  }

  if (!promocion) {
    displayStudentFormError('Promoción es obligatoria.');
    return;
  }

  const payload = { nombre, apellidos, email, promocion, estado };

  try {
    if (state.studentFormMode === 'edit') {
      if (!state.selectedStudent) {
        displayStudentFormError('No hay alumno seleccionado para editar.');
        return;
      }
      await api(`/api/alumnos/${state.selectedStudent._id}`, {
        method: 'PUT',
        body: payload
      });
      showToast('Alumno actualizado exitosamente');
    } else {
      await api('/api/alumnos', {
        method: 'POST',
        body: payload
      });
      showToast('Alumno creado exitosamente');
    }

    hideStudentForm();
    state.selectedStudent = null;
    await loadDashboard();
  } catch (err) {
    const details = err.payload?.details?.map((item) => `${item.field}: ${item.message}`).join('; ');
    displayStudentFormError(details || err.message || 'Error al guardar alumno');
  }
}

async function deleteAlumno() {
  if (!state.selectedStudent) {
    showToast('Por favor selecciona un alumno');
    return;
  }

  const confirm = window.confirm(`¿Estás seguro de que quieres eliminar a ${state.selectedStudent.nombre} ${state.selectedStudent.apellidos}?`);
  if (!confirm) return;

  try {
    await api(`/api/alumnos/${state.selectedStudent._id}`, {
      method: 'DELETE'
    });
    state.selectedStudent = null;
    await loadDashboard();
    showToast('Alumno eliminado exitosamente');
  } catch (err) {
    showToast(`Error al eliminar alumno: ${err.message}`);
  }
}

function statusTag(value) {
  const clean = String(value);
  const className = clean === 'apto' || clean === 'activo' ? 'ok' : clean === 'riesgo' || clean === 'no apto' ? 'error' : '';
  return `<span class="tag ${className}">${escapeHtml(clean)}</span>`;
}

function tableEmptyRow(columns, text) {
  return `<tr><td colspan="${columns}" class="muted">${escapeHtml(text)}</td></tr>`;
}

function emptyState(text) {
  return `<div class="list-item"><span>${escapeHtml(text)}</span></div>`;
}

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function bindEvents() {
  $$('.nav-item').forEach((button) => {
    button.addEventListener('click', () => {
      $$('.nav-item').forEach((item) => item.classList.remove('active'));
      button.classList.add('active');
      $$('.section').forEach((panel) => {
        panel.classList.toggle('active', panel.dataset.panel === button.dataset.section);
      });
    });
  });

  elements.logoutBtn.addEventListener('click', clearSession);
  elements.refreshBtn.addEventListener('click', loadDashboard);
  elements.studentSearch.addEventListener('input', renderStudents);
  elements.permissionTestBtn.addEventListener('click', runPermissionTest);
<<<<<<< HEAD
  elements.btnEditStudent.addEventListener('click', editAlumno);
  elements.btnCreateStudent.addEventListener('click', createAlumno);
  elements.btnDeleteStudent.addEventListener('click', deleteAlumno);
  elements.studentForm.addEventListener('submit', submitStudentForm);
  elements.studentFormCancel.addEventListener('click', hideStudentForm);

  updateActionsVisibility();
=======
  $('#studentsTable').addEventListener('click', handleStudentTableClick);
  elements.createStudentBtn.addEventListener('click', createStudent);
  elements.editStudentBtn.addEventListener('click', editStudent);
  elements.deleteStudentBtn.addEventListener('click', () => deleteStudent(state.selectedAlumnoId));
  elements.studentForm.addEventListener('submit', submitStudentForm);
  $('#cancelStudentBtn').addEventListener('click', closeStudentForm);
>>>>>>> d753a4f9a03c7e5af622ca411e3ce34c98dc8fe5
}

async function boot() {
  if (!requireSession()) return;

  elements.roleBadge.textContent = formatRole(state.user.role);
  bindEvents();
  await checkHealth();
  await loadDashboard();
}

boot();
