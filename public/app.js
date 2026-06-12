const state = {
  token: localStorage.getItem('aprenticToken') || '',
  user: JSON.parse(localStorage.getItem('aprenticUser') || 'null'),
  alumnos: [],
  proyectos: [],
  notas: [],
  promociones: [],
  campus: [],
  profesores: [],
  selectedAlumnoId: null,
  selectedCampusId: null,
  selectedPromocionId: null,
  selectedProfesorId: null,
  selectedProjectId: null,
  selectedNoteId: null,
  formMode: 'create',
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
  campusSearch: $('#campusSearch'),
  promocionSearch: $('#promocionSearch'),
  profesorSearch: $('#profesorSearch'),
  projectSearch: $('#projectSearch'),
  permissionTestBtn: $('#permissionTestBtn'),
  permissionResult: $('#permissionResult'),
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
  createCampusBtn: $('#createCampusBtn'),
  editCampusBtn: $('#editCampusBtn'),
  deleteCampusBtn: $('#deleteCampusBtn'),
  campusSelectionLabel: $('#campusSelectionLabel'),
  campusFormPanel: $('#campusFormPanel'),
  campusForm: $('#campusForm'),
  campusFormTitle: $('#campusFormTitle'),
  campusNameInput: $('#campusNameInput'),
  campusCityInput: $('#campusCityInput'),
  campusAddressInput: $('#campusAddressInput'),
  createPromocionBtn: $('#createPromocionBtn'),
  editPromocionBtn: $('#editPromocionBtn'),
  deletePromocionBtn: $('#deletePromocionBtn'),
  promocionSelectionLabel: $('#promocionSelectionLabel'),
  promocionFormPanel: $('#promocionFormPanel'),
  promocionForm: $('#promocionForm'),
  promocionFormTitle: $('#promocionFormTitle'),
  promocionNameInput: $('#promocionNameInput'),
  promocionCodeInput: $('#promocionCodeInput'),
  promocionCampusInput: $('#promocionCampusInput'),
  promocionModalidadInput: $('#promocionModalidadInput'),
  promocionInicioInput: $('#promocionInicioInput'),
  promocionFinInput: $('#promocionFinInput'),
  createProfesorBtn: $('#createProfesorBtn'),
  editProfesorBtn: $('#editProfesorBtn'),
  deleteProfesorBtn: $('#deleteProfesorBtn'),
  profesorSelectionLabel: $('#profesorSelectionLabel'),
  profesorFormPanel: $('#profesorFormPanel'),
  profesorForm: $('#profesorForm'),
  profesorFormTitle: $('#profesorFormTitle'),
  profesorNameInput: $('#profesorNameInput'),
  profesorLastNameInput: $('#profesorLastNameInput'),
  profesorEmailInput: $('#profesorEmailInput'),
  profesorEspecialidadInput: $('#profesorEspecialidadInput'),
  profesorCampusInput: $('#profesorCampusInput'),
  profesorPromocionesInput: $('#profesorPromocionesInput'),
  createProjectBtn: $('#createProjectBtn'),
  editProjectBtn: $('#editProjectBtn'),
  deleteProjectBtn: $('#deleteProjectBtn'),
  projectSelectionLabel: $('#projectSelectionLabel'),
  projectFormPanel: $('#projectFormPanel'),
  projectForm: $('#projectForm'),
  projectFormTitle: $('#projectFormTitle'),
  projectNameInput: $('#projectNameInput'),
  projectModuloInput: $('#projectModuloInput'),
  projectPromocionInput: $('#projectPromocionInput'),
  projectProfesorInput: $('#projectProfesorInput'),
  projectDescriptionInput: $('#projectDescriptionInput'),
  projectFechaEntregaInput: $('#projectFechaEntregaInput'),
  createNoteBtn: $('#createNoteBtn'),
  deleteNoteBtn: $('#deleteNoteBtn'),
  noteSelectionLabel: $('#noteSelectionLabel'),
  noteFormPanel: $('#noteFormPanel'),
  noteForm: $('#noteForm'),
  noteFormTitle: $('#noteFormTitle'),
  noteAlumnoInput: $('#noteAlumnoInput'),
  noteProyectoInput: $('#noteProyectoInput'),
  noteProfesorInput: $('#noteProfesorInput'),
  noteScoreInput: $('#noteScoreInput'),
  noteFeedbackInput: $('#noteFeedbackInput')
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
    const [alumnos, proyectos, notas, campus, promociones, profesores, tasa, riesgo, ranking] = await Promise.all([
      api('/api/alumnos?limit=50&sort=apellidos').catch(emptyList),
      api('/api/proyectos?limit=50&sort=nombre').catch(emptyList),
      api('/api/notas?limit=50&sort=-updatedAt').catch(emptyList),
      api('/api/campus?limit=50&sort=nombre').catch(emptyList),
      api('/api/promociones?limit=50&sort=codigo').catch(emptyList),
      api('/api/profesores?limit=50&sort=nombre').catch(emptyList),
      api('/api/analytics/tasa-aptos-campus').catch(emptyData),
      api('/api/analytics/alumnos-riesgo?threshold=60&minNoAptos=1').catch(emptyData),
      api('/api/analytics/ranking-proyectos-no-aptos?limit=5').catch(emptyData)
    ]);

    state.alumnos = alumnos.items || [];
    state.proyectos = proyectos.items || [];
    state.notas = notas.items || [];
    state.campus = campus.items || [];
    state.promociones = promociones.items || [];
    state.profesores = profesores.items || [];
    state.analytics.campus = tasa.data || [];
    state.analytics.riesgo = riesgo.data || [];
    state.analytics.ranking = ranking.data || [];

    renderPromotionOptions();
    renderCampusOptions();
    renderProfesorOptions();
    renderAlumnoOptions();
    renderProjectOptions();
    renderNoteOptions();
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
  renderCampusList();
  renderPromocionesList();
  renderProfesoresList();
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

  $('#studentsTable').innerHTML = rows.length
    ? rows.map(studentRow).join('')
    : tableEmptyRow(5, 'No hay alumnos para mostrar');

  updateStudentActions();
}

function studentRow(alumno) {
  const promocion = alumno.promocion || {};
  const campus = promocion.campus || {};
  const selected = alumno._id === state.selectedAlumnoId ? 'selected-row' : '';

  return `
    <tr data-id="${escapeHtml(alumno._id)}" class="${selected}">
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

function renderCampusList() {
  const query = elements.campusSearch.value.trim().toLowerCase();
  const rows = state.campus.filter((item) => {
    const text = `${item.nombre} ${item.ciudad} ${item.direccion || ''}`.toLowerCase();
    return text.includes(query);
  });

  $('#campusTable').innerHTML = rows.length
    ? rows.map(campusRow).join('')
    : tableEmptyRow(3, 'No hay campus para mostrar');

  updateCampusActions();
}

function campusRow(campusItem) {
  const selected = campusItem._id === state.selectedCampusId ? 'selected-row' : '';
  return `
    <tr data-id="${escapeHtml(campusItem._id)}" class="${selected}">
      <td>${escapeHtml(campusItem.nombre)}</td>
      <td>${escapeHtml(campusItem.ciudad)}</td>
      <td>${escapeHtml(campusItem.direccion || '-')}</td>
    </tr>
  `;
}

function renderPromocionesList() {
  const query = elements.promocionSearch.value.trim().toLowerCase();
  const rows = state.promociones.filter((item) => {
    const text = `${item.codigo} ${item.nombre} ${item.campus?.nombre || ''}`.toLowerCase();
    return text.includes(query);
  });

  $('#promocionesTable').innerHTML = rows.length
    ? rows.map(promocionRow).join('')
    : tableEmptyRow(4, 'No hay promociones para mostrar');

  updatePromocionActions();
}

function promocionRow(promocion) {
  const selected = promocion._id === state.selectedPromocionId ? 'selected-row' : '';
  return `
    <tr data-id="${escapeHtml(promocion._id)}" class="${selected}">
      <td>${escapeHtml(promocion.codigo)}</td>
      <td>${escapeHtml(promocion.nombre)}</td>
      <td>${escapeHtml(promocion.campus?.nombre || '-')}</td>
      <td>${escapeHtml(promocion.modalidad || '-')}</td>
    </tr>
  `;
}

function renderProfesoresList() {
  const query = elements.profesorSearch.value.trim().toLowerCase();
  const rows = state.profesores.filter((profesor) => {
    const text = `${profesor.nombre} ${profesor.apellidos} ${profesor.email} ${profesor.especialidad || ''}`.toLowerCase();
    return text.includes(query);
  });

  $('#profesoresTable').innerHTML = rows.length
    ? rows.map(profesorRow).join('')
    : tableEmptyRow(4, 'No hay profesores para mostrar');

  updateProfesorActions();
}

function profesorRow(profesor) {
  const selected = profesor._id === state.selectedProfesorId ? 'selected-row' : '';
  return `
    <tr data-id="${escapeHtml(profesor._id)}" class="${selected}">
      <td>
        <div class="student-name">
          <strong>${escapeHtml(profesor.nombre)} ${escapeHtml(profesor.apellidos)}</strong>
          <span>${escapeHtml(profesor._id)}</span>
        </div>
      </td>
      <td>${escapeHtml(profesor.email)}</td>
      <td>${escapeHtml(profesor.campus?.nombre || '-')}</td>
      <td>${escapeHtml(profesor.especialidad || '-')}</td>
    </tr>
  `;
}

function renderProjects() {
  const query = elements.projectSearch.value.trim().toLowerCase();
  const rows = state.proyectos.filter((proyecto) => {
    const text = `${proyecto.nombre} ${proyecto.modulo} ${proyecto.descripcion || ''}`.toLowerCase();
    return text.includes(query);
  });

  $('#projectsTable').innerHTML = rows.length
    ? rows.map(projectRow).join('')
    : tableEmptyRow(4, 'No hay proyectos para mostrar');

  updateProjectActions();
}

function projectRow(proyecto) {
  const promocion = proyecto.promocion || {};
  const profesor = proyecto.profesor || {};
  const selected = proyecto._id === state.selectedProjectId ? 'selected-row' : '';
  return `
    <tr data-id="${escapeHtml(proyecto._id)}" class="${selected}">
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

  updateNoteActions();
}

function gradeRow(nota) {
  const alumno = nota.alumno || {};
  const proyecto = nota.proyecto || {};
  const profesor = nota.profesor || {};
  const selected = nota._id === state.selectedNoteId ? 'selected-row' : '';
  const canEdit = state.user?.role === 'admin' || state.user?.role === 'profesor';
  return `
    <tr data-id="${escapeHtml(nota._id)}" class="${selected}">
      <td>${escapeHtml(`${alumno.nombre || ''} ${alumno.apellidos || ''}`.trim() || '-')}</td>
      <td>${escapeHtml(proyecto.nombre || '-')}</td>
      <td>${escapeHtml(`${profesor.nombre || ''} ${profesor.apellidos || ''}`.trim() || '-')}</td>
      <td>
        <div class="score-control">
          <input id="score-${escapeHtml(nota._id)}" type="number" min="0" max="100" value="${Number(nota.score || 0)}" ${canEdit ? '' : 'disabled'}>
        </div>
      </td>
      <td>${nota.apto ? statusTag('apto') : statusTag('no apto')}</td>
      <td>${canEdit ? `<button class="score-action" type="button" data-id="${escapeHtml(nota._id)}">Guardar</button>` : '<span class="muted">Lectura</span>'}</td>
    </tr>
  `;
}

function renderAlumnoOptions() {
  elements.noteAlumnoInput.innerHTML = `
    <option value="">Selecciona un alumno</option>
    ${state.alumnos.map((alumno) => `<option value="${escapeHtml(alumno._id)}">${escapeHtml(alumno.nombre)} ${escapeHtml(alumno.apellidos)}</option>`).join('')}
  `;
}

function renderPromotionOptions() {
  elements.studentPromocionInput.innerHTML = `
    <option value="">Selecciona una promocion</option>
    ${state.promociones.map((promocion) => {
      const label = `${promocion.codigo}${promocion.nombre ? ` — ${promocion.nombre}` : ''}`;
      return `<option value="${escapeHtml(promocion._id)}">${escapeHtml(label)}</option>`;
    }).join('')}
  `;
}

function renderCampusOptions() {
  elements.promocionCampusInput.innerHTML = `
    <option value="">Selecciona un campus</option>
    ${state.campus.map((campus) => `<option value="${escapeHtml(campus._id)}">${escapeHtml(campus.nombre)} (${escapeHtml(campus.ciudad)})</option>`).join('')}
  `;

  elements.profesorCampusInput.innerHTML = `
    <option value="">Selecciona un campus</option>
    ${state.campus.map((campus) => `<option value="${escapeHtml(campus._id)}">${escapeHtml(campus.nombre)} (${escapeHtml(campus.ciudad)})</option>`).join('')}
  `;
}

function renderProfesorOptions() {
  elements.projectProfesorInput.innerHTML = `
    <option value="">Selecciona un profesor</option>
    ${state.profesores.map((profesor) => `<option value="${escapeHtml(profesor._id)}">${escapeHtml(profesor.nombre)} ${escapeHtml(profesor.apellidos)}</option>`).join('')}
  `;
}

function renderProjectOptions() {
  elements.projectPromocionInput.innerHTML = `
    <option value="">Selecciona una promocion</option>
    ${state.promociones.map((promocion) => `<option value="${escapeHtml(promocion._id)}">${escapeHtml(promocion.codigo)} ${escapeHtml(promocion.nombre)}</option>`).join('')}
  `;

  elements.noteProyectoInput.innerHTML = `
    <option value="">Selecciona un proyecto</option>
    ${state.proyectos.map((proyecto) => `<option value="${escapeHtml(proyecto._id)}">${escapeHtml(proyecto.nombre)} (${escapeHtml(proyecto.modulo)})</option>`).join('')}
  `;
}

function renderNoteOptions() {
  elements.noteAlumnoInput.innerHTML = `
    <option value="">Selecciona un alumno</option>
    ${state.alumnos.map((alumno) => `<option value="${escapeHtml(alumno._id)}">${escapeHtml(alumno.nombre)} ${escapeHtml(alumno.apellidos)}</option>`).join('')}
  `;

  elements.noteProyectoInput.innerHTML = `
    <option value="">Selecciona un proyecto</option>
    ${state.proyectos.map((proyecto) => `<option value="${escapeHtml(proyecto._id)}">${escapeHtml(proyecto.nombre)} (${escapeHtml(proyecto.modulo)})</option>`).join('')}
  `;

  elements.noteProfesorInput.innerHTML = `
    <option value="">Selecciona un profesor</option>
    ${state.profesores.map((profesor) => `<option value="${escapeHtml(profesor._id)}">${escapeHtml(profesor.nombre)} ${escapeHtml(profesor.apellidos)}</option>`).join('')}
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

function updateCampusActions() {
  const isAdmin = state.user?.role === 'admin';
  elements.editCampusBtn.disabled = !isAdmin || !state.selectedCampusId;
  elements.deleteCampusBtn.disabled = !isAdmin || !state.selectedCampusId;
  elements.campusSelectionLabel.textContent = state.selectedCampusId
    ? 'Campus seleccionado' : 'Selecciona un campus para editar o eliminar';
}

function updatePromocionActions() {
  const isAdmin = state.user?.role === 'admin';
  elements.editPromocionBtn.disabled = !isAdmin || !state.selectedPromocionId;
  elements.deletePromocionBtn.disabled = !isAdmin || !state.selectedPromocionId;
  elements.promocionSelectionLabel.textContent = state.selectedPromocionId
    ? 'Promocion seleccionada' : 'Selecciona una promocion para editar o eliminar';
}

function updateProfesorActions() {
  const isAdmin = state.user?.role === 'admin';
  elements.editProfesorBtn.disabled = !isAdmin || !state.selectedProfesorId;
  elements.deleteProfesorBtn.disabled = !isAdmin || !state.selectedProfesorId;
  elements.profesorSelectionLabel.textContent = state.selectedProfesorId
    ? 'Profesor seleccionado' : 'Selecciona un profesor para editar o eliminar';
}

function updateProjectActions() {
  const isAdmin = state.user?.role === 'admin';
  elements.editProjectBtn.disabled = !isAdmin || !state.selectedProjectId;
  elements.deleteProjectBtn.disabled = !isAdmin || !state.selectedProjectId;
  elements.projectSelectionLabel.textContent = state.selectedProjectId
    ? 'Proyecto seleccionado' : 'Selecciona un proyecto para editar o eliminar';
}

function updateNoteActions() {
  const canManage = state.user?.role === 'admin' || state.user?.role === 'profesor';
  elements.deleteNoteBtn.disabled = !(state.user?.role === 'admin') || !state.selectedNoteId;
  elements.createNoteBtn.disabled = !canManage;
  elements.noteSelectionLabel.textContent = state.selectedNoteId
    ? 'Nota seleccionada' : 'Selecciona una nota para eliminar';
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

  const body = { nombre, apellidos, email, promocion, estado };

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

function openCampusForm(id) {
  const campus = id ? state.campus.find((item) => item._id === id) : null;
  state.formMode = id ? 'edit' : 'create';
  state.selectedCampusId = id || state.selectedCampusId;

  elements.campusFormTitle.textContent = id ? 'Editar campus' : 'Crear campus';
  elements.campusNameInput.value = campus?.nombre || '';
  elements.campusCityInput.value = campus?.ciudad || '';
  elements.campusAddressInput.value = campus?.direccion || '';
  elements.campusFormPanel.classList.remove('hidden');
  elements.campusNameInput.focus();
}

function closeCampusForm() {
  state.formMode = 'create';
  elements.campusFormPanel.classList.add('hidden');
  elements.campusForm.reset();
}

async function submitCampusForm(event) {
  event.preventDefault();

  const nombre = elements.campusNameInput.value.trim();
  const ciudad = elements.campusCityInput.value.trim();
  const direccion = elements.campusAddressInput.value.trim();

  if (!nombre || !ciudad) {
    showToast('Completa nombre y ciudad del campus.');
    return;
  }

  const body = { nombre, ciudad, direccion };

  try {
    if (state.formMode === 'edit') {
      await api(`/api/campus/${encodeURIComponent(state.selectedCampusId)}`, {
        method: 'PUT',
        body
      });
      showToast('Campus actualizado correctamente');
    } else {
      await api('/api/campus', {
        method: 'POST',
        body
      });
      showToast('Campus creado correctamente');
    }

    closeCampusForm();
    await loadDashboard();
  } catch (err) {
    showToast(err.message);
  }
}

function createCampus() {
  openCampusForm();
}

function editCampus() {
  if (!state.selectedCampusId) {
    showToast('Selecciona un campus para editar');
    return;
  }

  openCampusForm(state.selectedCampusId);
}

async function deleteCampus(id) {
  if (!id) {
    showToast('Selecciona un campus para eliminar');
    return;
  }

  const confirmed = confirm('¿Seguro que quieres eliminar este campus?');
  if (!confirmed) return;

  try {
    await api(`/api/campus/${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });
    state.selectedCampusId = null;
    await loadDashboard();
    showToast('Campus eliminado correctamente');
  } catch (err) {
    showToast(err.message);
  }
}

function handleCampusTableClick(event) {
  const row = event.target.closest('tr[data-id]');
  if (!row) return;

  const id = row.dataset.id;
  state.selectedCampusId = state.selectedCampusId === id ? null : id;
  renderCampusList();
}

function openPromocionForm(id) {
  const promocion = id ? state.promociones.find((item) => item._id === id) : null;
  state.formMode = id ? 'edit' : 'create';
  state.selectedPromocionId = id || state.selectedPromocionId;

  elements.promocionFormTitle.textContent = id ? 'Editar promocion' : 'Crear promocion';
  elements.promocionNameInput.value = promocion?.nombre || '';
  elements.promocionCodeInput.value = promocion?.codigo || '';
  elements.promocionCampusInput.value = promocion?.campus?._id || '';
  elements.promocionModalidadInput.value = promocion?.modalidad || 'presencial';
  elements.promocionInicioInput.value = promocion?.fechaInicio ? promocion.fechaInicio.split('T')[0] : '';
  elements.promocionFinInput.value = promocion?.fechaFin ? promocion.fechaFin.split('T')[0] : '';
  elements.promocionFormPanel.classList.remove('hidden');
  elements.promocionNameInput.focus();
}

function closePromocionForm() {
  state.formMode = 'create';
  elements.promocionFormPanel.classList.add('hidden');
  elements.promocionForm.reset();
}

async function submitPromocionForm(event) {
  event.preventDefault();

  const nombre = elements.promocionNameInput.value.trim();
  const codigo = elements.promocionCodeInput.value.trim();
  const campus = elements.promocionCampusInput.value;
  const modalidad = elements.promocionModalidadInput.value;
  const fechaInicio = elements.promocionInicioInput.value || undefined;
  const fechaFin = elements.promocionFinInput.value || undefined;

  if (!nombre || !codigo || !campus) {
    showToast('Completa nombre, codigo y campus de la promocion.');
    return;
  }

  const body = { nombre, codigo, campus, modalidad, fechaInicio, fechaFin };

  try {
    if (state.formMode === 'edit') {
      await api(`/api/promociones/${encodeURIComponent(state.selectedPromocionId)}`, {
        method: 'PUT',
        body
      });
      showToast('Promocion actualizada correctamente');
    } else {
      await api('/api/promociones', {
        method: 'POST',
        body
      });
      showToast('Promocion creada correctamente');
    }

    closePromocionForm();
    await loadDashboard();
  } catch (err) {
    showToast(err.message);
  }
}

function createPromocion() {
  openPromocionForm();
}

function editPromocion() {
  if (!state.selectedPromocionId) {
    showToast('Selecciona una promocion para editar');
    return;
  }

  openPromocionForm(state.selectedPromocionId);
}

async function deletePromocion(id) {
  if (!id) {
    showToast('Selecciona una promocion para eliminar');
    return;
  }

  const confirmed = confirm('¿Seguro que quieres eliminar esta promocion?');
  if (!confirmed) return;

  try {
    await api(`/api/promociones/${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });
    state.selectedPromocionId = null;
    await loadDashboard();
    showToast('Promocion eliminada correctamente');
  } catch (err) {
    showToast(err.message);
  }
}

function handlePromocionTableClick(event) {
  const row = event.target.closest('tr[data-id]');
  if (!row) return;

  const id = row.dataset.id;
  state.selectedPromocionId = state.selectedPromocionId === id ? null : id;
  renderPromocionesList();
}

function openProfesorForm(id) {
  const profesor = id ? state.profesores.find((item) => item._id === id) : null;
  state.formMode = id ? 'edit' : 'create';
  state.selectedProfesorId = id || state.selectedProfesorId;

  elements.profesorFormTitle.textContent = id ? 'Editar profesor' : 'Crear profesor';
  elements.profesorNameInput.value = profesor?.nombre || '';
  elements.profesorLastNameInput.value = profesor?.apellidos || '';
  elements.profesorEmailInput.value = profesor?.email || '';
  elements.profesorEspecialidadInput.value = profesor?.especialidad || '';
  elements.profesorCampusInput.value = profesor?.campus?._id || '';
  elements.profesorPromocionesInput.innerHTML = state.promociones
    .map((promocion) => `
      <option value="${escapeHtml(promocion._id)}" ${profesor?.promociones?.some((item) => item.toString() === promocion._id.toString()) ? 'selected' : ''}>
        ${escapeHtml(promocion.codigo)}
      </option>
    `)
    .join('');

  elements.profesorFormPanel.classList.remove('hidden');
  elements.profesorNameInput.focus();
}

function closeProfesorForm() {
  state.formMode = 'create';
  elements.profesorFormPanel.classList.add('hidden');
  elements.profesorForm.reset();
}

async function submitProfesorForm(event) {
  event.preventDefault();

  const nombre = elements.profesorNameInput.value.trim();
  const apellidos = elements.profesorLastNameInput.value.trim();
  const email = elements.profesorEmailInput.value.trim();
  const especialidad = elements.profesorEspecialidadInput.value.trim();
  const campus = elements.profesorCampusInput.value;
  const promociones = [...elements.profesorPromocionesInput.selectedOptions].map((option) => option.value);

  if (!nombre || !apellidos || !email || !campus) {
    showToast('Completa nombre, apellidos, email y campus del profesor.');
    return;
  }

  const body = { nombre, apellidos, email, especialidad, campus, promociones };

  try {
    if (state.formMode === 'edit') {
      await api(`/api/profesores/${encodeURIComponent(state.selectedProfesorId)}`, {
        method: 'PUT',
        body
      });
      showToast('Profesor actualizado correctamente');
    } else {
      await api('/api/profesores', {
        method: 'POST',
        body
      });
      showToast('Profesor creado correctamente');
    }

    closeProfesorForm();
    await loadDashboard();
  } catch (err) {
    showToast(err.message);
  }
}

function createProfesor() {
  openProfesorForm();
}

function editProfesor() {
  if (!state.selectedProfesorId) {
    showToast('Selecciona un profesor para editar');
    return;
  }

  openProfesorForm(state.selectedProfesorId);
}

async function deleteProfesor(id) {
  if (!id) {
    showToast('Selecciona un profesor para eliminar');
    return;
  }

  const confirmed = confirm('¿Seguro que quieres eliminar este profesor?');
  if (!confirmed) return;

  try {
    await api(`/api/profesores/${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });
    state.selectedProfesorId = null;
    await loadDashboard();
    showToast('Profesor eliminado correctamente');
  } catch (err) {
    showToast(err.message);
  }
}

function handleProfesorTableClick(event) {
  const row = event.target.closest('tr[data-id]');
  if (!row) return;

  const id = row.dataset.id;
  state.selectedProfesorId = state.selectedProfesorId === id ? null : id;
  renderProfesoresList();
}

function openProjectForm(id) {
  const proyecto = id ? state.proyectos.find((item) => item._id === id) : null;
  state.formMode = id ? 'edit' : 'create';
  state.selectedProjectId = id || state.selectedProjectId;

  elements.projectFormTitle.textContent = id ? 'Editar proyecto' : 'Crear proyecto';
  elements.projectNameInput.value = proyecto?.nombre || '';
  elements.projectModuloInput.value = proyecto?.modulo || '';
  elements.projectPromocionInput.value = proyecto?.promocion?._id || '';
  elements.projectProfesorInput.value = proyecto?.profesor?._id || '';
  elements.projectDescriptionInput.value = proyecto?.descripcion || '';
  elements.projectFechaEntregaInput.value = proyecto?.fechaEntrega ? proyecto.fechaEntrega.split('T')[0] : '';
  elements.projectFormPanel.classList.remove('hidden');
  elements.projectNameInput.focus();
}

function closeProjectForm() {
  state.formMode = 'create';
  elements.projectFormPanel.classList.add('hidden');
  elements.projectForm.reset();
}

async function submitProjectForm(event) {
  event.preventDefault();

  const nombre = elements.projectNameInput.value.trim();
  const modulo = elements.projectModuloInput.value.trim();
  const promocion = elements.projectPromocionInput.value;
  const profesor = elements.projectProfesorInput.value;
  const descripcion = elements.projectDescriptionInput.value.trim();
  const fechaEntrega = elements.projectFechaEntregaInput.value || undefined;

  if (!nombre || !modulo || !promocion || !profesor) {
    showToast('Completa nombre, modulo, promocion y profesor del proyecto.');
    return;
  }

  const body = { nombre, modulo, promocion, profesor, descripcion, fechaEntrega };

  try {
    if (state.formMode === 'edit') {
      await api(`/api/proyectos/${encodeURIComponent(state.selectedProjectId)}`, {
        method: 'PUT',
        body
      });
      showToast('Proyecto actualizado correctamente');
    } else {
      await api('/api/proyectos', {
        method: 'POST',
        body
      });
      showToast('Proyecto creado correctamente');
    }

    closeProjectForm();
    await loadDashboard();
  } catch (err) {
    showToast(err.message);
  }
}

function createProject() {
  openProjectForm();
}

function editProject() {
  if (!state.selectedProjectId) {
    showToast('Selecciona un proyecto para editar');
    return;
  }

  openProjectForm(state.selectedProjectId);
}

async function deleteProject(id) {
  if (!id) {
    showToast('Selecciona un proyecto para eliminar');
    return;
  }

  const confirmed = confirm('¿Seguro que quieres eliminar este proyecto?');
  if (!confirmed) return;

  try {
    await api(`/api/proyectos/${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });
    state.selectedProjectId = null;
    await loadDashboard();
    showToast('Proyecto eliminado correctamente');
  } catch (err) {
    showToast(err.message);
  }
}

function handleProjectTableClick(event) {
  const row = event.target.closest('tr[data-id]');
  if (!row) return;

  const id = row.dataset.id;
  state.selectedProjectId = state.selectedProjectId === id ? null : id;
  renderProjects();
}

function openNoteForm(id) {
  const nota = id ? state.notas.find((item) => item._id === id) : null;
  state.formMode = id ? 'edit' : 'create';
  state.selectedNoteId = id || state.selectedNoteId;

  elements.noteFormTitle.textContent = id ? 'Editar nota' : 'Crear nota';
  elements.noteAlumnoInput.value = nota?.alumno?._id || '';
  elements.noteProyectoInput.value = nota?.proyecto?._id || '';
  elements.noteProfesorInput.value = nota?.profesor?._id || '';
  elements.noteScoreInput.value = nota?.score ?? 0;
  elements.noteFeedbackInput.value = nota?.feedback || '';
  elements.noteFormPanel.classList.remove('hidden');
  elements.noteScoreInput.focus();
}

function closeNoteForm() {
  state.formMode = 'create';
  elements.noteFormPanel.classList.add('hidden');
  elements.noteForm.reset();
}

async function submitNoteForm(event) {
  event.preventDefault();

  const alumno = elements.noteAlumnoInput.value;
  const proyecto = elements.noteProyectoInput.value;
  const profesor = elements.noteProfesorInput.value;
  const score = Number(elements.noteScoreInput.value);
  const feedback = elements.noteFeedbackInput.value.trim();

  if (!alumno || !proyecto || !profesor || Number.isNaN(score)) {
    showToast('Completa alumno, proyecto, profesor y score.');
    return;
  }

  if (score < 0 || score > 100) {
    showToast('La nota debe estar entre 0 y 100');
    return;
  }

  const body = { alumno, proyecto, profesor, score, feedback };

  try {
    if (state.formMode === 'edit') {
      await api(`/api/notas/${encodeURIComponent(state.selectedNoteId)}`, {
        method: 'PUT',
        body
      });
      showToast('Nota actualizada correctamente');
    } else {
      await api('/api/notas', {
        method: 'POST',
        body
      });
      showToast('Nota creada correctamente');
    }

    closeNoteForm();
    await loadDashboard();
  } catch (err) {
    showToast(err.message);
  }
}

function createNote() {
  openNoteForm();
}

async function deleteNote(id) {
  if (!id) {
    showToast('Selecciona una nota para eliminar');
    return;
  }

  const confirmed = confirm('¿Seguro que quieres eliminar esta nota?');
  if (!confirmed) return;

  try {
    await api(`/api/notas/${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });
    state.selectedNoteId = null;
    await loadDashboard();
    showToast('Nota eliminada correctamente');
  } catch (err) {
    showToast(err.message);
  }
}

function handleNoteTableClick(event) {
  const row = event.target.closest('tr[data-id]');
  if (!row) return;

  const id = row.dataset.id;
  state.selectedNoteId = state.selectedNoteId === id ? null : id;
  renderGrades();
}

async function updateGrade(id) {
  const input = $(`#score-${CSS.escape(id)}`);
  const score = Number(input.value);

  if (Number.isNaN(score) || score < 0 || score > 100) {
    showToast('La nota debe estar entre 0 y 100');
    return;
  }

  try {
    await api(`/api/notas/${encodeURIComponent(id)}`, {
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
  elements.campusSearch.addEventListener('input', renderCampusList);
  elements.promocionSearch.addEventListener('input', renderPromocionesList);
  elements.profesorSearch.addEventListener('input', renderProfesoresList);
  elements.projectSearch.addEventListener('input', renderProjects);
  elements.permissionTestBtn.addEventListener('click', runPermissionTest);
  $('#studentsTable').addEventListener('click', handleStudentTableClick);
  $('#campusTable').addEventListener('click', handleCampusTableClick);
  $('#promocionesTable').addEventListener('click', handlePromocionTableClick);
  $('#profesoresTable').addEventListener('click', handleProfesorTableClick);
  $('#projectsTable').addEventListener('click', handleProjectTableClick);
  $('#gradesTable').addEventListener('click', handleNoteTableClick);
  elements.createStudentBtn.addEventListener('click', createStudent);
  elements.editStudentBtn.addEventListener('click', editStudent);
  elements.deleteStudentBtn.addEventListener('click', () => deleteStudent(state.selectedAlumnoId));
  elements.studentForm.addEventListener('submit', submitStudentForm);
  $('#cancelStudentBtn').addEventListener('click', closeStudentForm);
  elements.createCampusBtn.addEventListener('click', createCampus);
  elements.editCampusBtn.addEventListener('click', editCampus);
  elements.deleteCampusBtn.addEventListener('click', () => deleteCampus(state.selectedCampusId));
  elements.campusForm.addEventListener('submit', submitCampusForm);
  $('#cancelCampusBtn').addEventListener('click', closeCampusForm);
  elements.createPromocionBtn.addEventListener('click', createPromocion);
  elements.editPromocionBtn.addEventListener('click', editPromocion);
  elements.deletePromocionBtn.addEventListener('click', () => deletePromocion(state.selectedPromocionId));
  elements.promocionForm.addEventListener('submit', submitPromocionForm);
  $('#cancelPromocionBtn').addEventListener('click', closePromocionForm);
  elements.createProfesorBtn.addEventListener('click', createProfesor);
  elements.editProfesorBtn.addEventListener('click', editProfesor);
  elements.deleteProfesorBtn.addEventListener('click', () => deleteProfesor(state.selectedProfesorId));
  elements.profesorForm.addEventListener('submit', submitProfesorForm);
  $('#cancelProfesorBtn').addEventListener('click', closeProfesorForm);
  elements.createProjectBtn.addEventListener('click', createProject);
  elements.editProjectBtn.addEventListener('click', editProject);
  elements.deleteProjectBtn.addEventListener('click', () => deleteProject(state.selectedProjectId));
  elements.projectForm.addEventListener('submit', submitProjectForm);
  $('#cancelProjectBtn').addEventListener('click', closeProjectForm);
  elements.createNoteBtn.addEventListener('click', createNote);
  elements.deleteNoteBtn.addEventListener('click', () => deleteNote(state.selectedNoteId));
  elements.noteForm.addEventListener('submit', submitNoteForm);
  $('#cancelNoteBtn').addEventListener('click', closeNoteForm);
}

async function boot() {
  if (!requireSession()) return;

  elements.roleBadge.textContent = formatRole(state.user.role);
  bindEvents();
  await checkHealth();
  await loadDashboard();
}

boot();
