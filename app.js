(() => {
  const USERNAME = 'grupo3';
  const PASSWORD = 'calidad123';
  const STORAGE_KEY = 'grupo3-tasks';
  const FILTER_KEY = 'grupo3-task-filter';
  const sessionKey = 'grupo3-authenticated';
  const statuses = { pending: 'Pendiente', progress: 'En progreso', done: 'Hecha' };
  const filters = ['all', ...Object.keys(statuses)];
  let tasks = loadTasks();
  let activeFilter = loadFilter();
  const $ = (selector, root = document) => root.querySelector(selector);
  const loginView = $('#login-view');
  const boardView = $('#board-view');
  const editDialog = $('#edit-task-dialog');

  function loadTasks() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      if (!Array.isArray(saved)) return [];
      return saved.filter(task => task && typeof task.id === 'string' && typeof task.title === 'string' && statuses[task.status])
        .map(task => ({ ...task, assignee: task.assignee || '', dueDate: task.dueDate || '' }));
    } catch { return []; }
  }
  function loadFilter() {
    const saved = localStorage.getItem(FILTER_KEY);
    return filters.includes(saved) ? saved : 'all';
  }
  function persist() { localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)); }
  function setFilter(filter) {
    activeFilter = filters.includes(filter) ? filter : 'all';
    localStorage.setItem(FILTER_KEY, activeFilter);
    document.querySelectorAll('.filter-button').forEach(button => {
      const selected = button.dataset.filter === activeFilter;
      button.classList.toggle('active', selected);
      button.setAttribute('aria-pressed', String(selected));
    });
    render();
  }
  function showBoard() { loginView.hidden = true; boardView.hidden = false; render(); }
  function showLogin() { boardView.hidden = true; loginView.hidden = false; }
  function formatDate(date) {
    if (!date) return '';
    const [year, month, day] = date.split('-').map(Number);
    return new Intl.DateTimeFormat('es-GT', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(year, month - 1, day));
  }
  function makeTaskRow(task) {
    const row = document.createElement('article');
    row.className = 'task-row';
    row.id = `task-${task.id}`;
    row.dataset.taskId = task.id;

    const content = document.createElement('div');
    const title = document.createElement('p');
    title.className = 'task-title';
    title.textContent = task.title;
    const meta = document.createElement('div');
    meta.className = 'task-meta task-details';
    const assignee = document.createElement('span');
    assignee.className = 'task-assignee';
    assignee.textContent = task.assignee ? `Responsable: ${task.assignee}` : 'Sin responsable';
    meta.append(assignee);
    if (task.dueDate) {
      const dueDate = document.createElement('span');
      dueDate.className = 'task-due-date';
      dueDate.textContent = `Fecha límite: ${formatDate(task.dueDate)}`;
      meta.append(dueDate);
    }
    content.append(title, meta);

    const controls = document.createElement('div');
    controls.className = 'task-controls';
    const badge = document.createElement('span');
    badge.className = `status-badge status-${task.status}`;
    badge.textContent = statuses[task.status];
    const select = document.createElement('select');
    select.className = 'status-select';
    select.setAttribute('aria-label', `Cambiar estado de ${task.title}`);
    select.dataset.taskId = task.id;
    Object.entries(statuses).forEach(([value, label]) => {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = label;
      option.selected = task.status === value;
      select.append(option);
    });
    const editButton = document.createElement('button');
    editButton.className = 'icon-button';
    editButton.type = 'button';
    editButton.dataset.action = 'edit';
    editButton.dataset.taskId = task.id;
    editButton.setAttribute('aria-label', `Editar ${task.title}`);
    editButton.textContent = 'Editar';
    const deleteButton = document.createElement('button');
    deleteButton.className = 'icon-button delete-button';
    deleteButton.type = 'button';
    deleteButton.dataset.action = 'delete';
    deleteButton.dataset.taskId = task.id;
    deleteButton.setAttribute('aria-label', `Eliminar ${task.title}`);
    deleteButton.textContent = 'Eliminar';
    controls.append(badge, select, editButton, deleteButton);
    row.append(content, controls);
    return row;
  }
  function render() {
    const visible = tasks.filter(task => activeFilter === 'all' || task.status === activeFilter);
    const list = $('#task-list');
    list.replaceChildren(...visible.map(makeTaskRow));
    Object.keys(statuses).forEach(status => {
      $(`#count-${status}`).textContent = String(visible.filter(task => task.status === status).length);
    });
    $('#visible-count').textContent = `${visible.length} ${visible.length === 1 ? 'tarea' : 'tareas'}`;
    $('#empty-state').hidden = visible.length > 0;
    document.querySelectorAll('.filter-button').forEach(button => {
      const selected = button.dataset.filter === activeFilter;
      button.classList.toggle('active', selected);
      button.setAttribute('aria-pressed', String(selected));
    });
  }
  function openEditDialog(task) {
    $('#edit-task-id').value = task.id;
    $('#edit-task-title').value = task.title;
    $('#edit-task-assignee').value = task.assignee;
    $('#edit-task-due-date').value = task.dueDate;
    $('#edit-task-error').hidden = true;
    editDialog.showModal();
    $('#edit-task-title').focus();
  }

  $('#login-form').addEventListener('submit', event => {
    event.preventDefault();
    const valid = $('#username').value.trim() === USERNAME && $('#password').value === PASSWORD;
    $('#login-error').hidden = valid;
    if (valid) { sessionStorage.setItem(sessionKey, 'true'); showBoard(); }
  });
  $('#logout-button').addEventListener('click', () => {
    sessionStorage.removeItem(sessionKey);
    showLogin();
    $('#login-form').reset();
  });
  $('#task-form').addEventListener('submit', event => {
    event.preventDefault();
    const input = $('#task-title');
    const title = input.value.trim();
    if (!title) { $('#task-error').hidden = false; input.focus(); return; }
    $('#task-error').hidden = true;
    tasks.unshift({
      id: globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      title,
      status: 'pending',
      assignee: $('#task-assignee').value,
      dueDate: $('#task-due-date').value
    });
    persist();
    event.currentTarget.reset();
    render();
  });
  $('#task-title').addEventListener('input', () => {
    if ($('#task-title').value.trim()) $('#task-error').hidden = true;
  });
  $('#task-list').addEventListener('change', event => {
    if (!event.target.matches('.status-select')) return;
    const task = tasks.find(item => item.id === event.target.dataset.taskId);
    if (!task || !statuses[event.target.value]) return;
    task.status = event.target.value;
    persist();
    render();
  });
  $('#task-list').addEventListener('click', event => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;
    const task = tasks.find(item => item.id === button.dataset.taskId);
    if (!task) return;
    if (button.dataset.action === 'edit') openEditDialog(task);
    if (button.dataset.action === 'delete' && window.confirm(`¿Eliminar la tarea "${task.title}"?`)) {
      tasks = tasks.filter(item => item.id !== task.id);
      persist();
      render();
    }
  });
  $('#edit-task-form').addEventListener('submit', event => {
    event.preventDefault();
    const title = $('#edit-task-title').value.trim();
    if (!title) { $('#edit-task-error').hidden = false; $('#edit-task-title').focus(); return; }
    const task = tasks.find(item => item.id === $('#edit-task-id').value);
    if (!task) { editDialog.close(); return; }
    task.title = title;
    task.assignee = $('#edit-task-assignee').value;
    task.dueDate = $('#edit-task-due-date').value;
    persist();
    editDialog.close();
    render();
  });
  $('#edit-task-title').addEventListener('input', () => {
    if ($('#edit-task-title').value.trim()) $('#edit-task-error').hidden = true;
  });
  $('#cancel-edit').addEventListener('click', () => editDialog.close());
  document.querySelectorAll('.filter-button').forEach(button => button.addEventListener('click', () => setFilter(button.dataset.filter)));
  if (sessionStorage.getItem(sessionKey) === 'true') showBoard();
})();
