const token = localStorage.getItem('token');
if (!token) location.href = '/';

function parseJwt(t) {
  try {
    return JSON.parse(atob(t.split('.')[1]));
  } catch (e) {
    return {};
  }
}

const user = parseJwt(token);
const role = user.role || 'client';

document.getElementById('btnLogout').onclick = () => {
  localStorage.removeItem('token');
  location.href = '/';
};

if (role === 'operator' || role === 'admin')
  document.getElementById('btnAddTour').style.display = 'inline-block';
if (role === 'admin') {
  document.getElementById('btnBookingsAdmin').style.display = 'inline-block';
  document.getElementById('btnGuides').style.display = 'inline-block';
}

document.getElementById('btnBookingsAdmin').onclick = () =>
  (location.href = '/admin_bookings.html');
document.getElementById('btnGuides').onclick = () =>
  (location.href = '/guides_admin.html');

async function apiFetch(url, opts = {}) {
  opts.headers = opts.headers || {};
  if (token) opts.headers['Authorization'] = 'Bearer ' + token;
  if (opts.body && !opts.headers['Content-Type'])
    opts.headers['Content-Type'] = 'application/json';
  try {
    const res = await fetch(url, opts);
    const text = await res.text();
    let data;
    try {
      data = text ? JSON.parse(text) : null;
    } catch (e) {
      data = text;
    }
    if (!res.ok) throw { status: res.status, body: data };
    return data;
  } catch (err) {
    if (err instanceof TypeError) throw { status: 0, body: err.message };
    throw err;
  }
}

async function loadTours() {
  const container = document.getElementById('toursList');
  container.innerHTML = 'Загрузка...';
  try {
    const tours = await apiFetch('/api/tours');
    let myBookings = [];
    try {
      myBookings = await apiFetch('/api/bookings/my');
    } catch (e) {
      console.warn('my bookings:', e);
    }
    container.innerHTML = '';
    if (!tours || tours.length === 0) {
      container.innerHTML = '<div>Туров нет</div>';
      return;
    }
    for (const t of tours) {
      const card = document.createElement('div');
      card.className = 'tour';
      card.innerHTML = `
        <h3>${escapeHtml(t.title)}</h3>
        <div class="meta">Локация: ${escapeHtml(t.location || '—')} · Цена: ${t.base_price} · Мест: ${t.max_participants}</div>
        ${t.guide_name ? `<div class="meta">Гид: ${escapeHtml(t.guide_name)}</div>` : ''}
        <p>${escapeHtml(t.description || '')}</p>
        <div id="controls-${t.id}" class="controls"></div>
        <div id="booking-form-${t.id}" class="booking-form hidden"></div>
        <div id="msg-${t.id}"></div>
      `;
      container.appendChild(card);
      await renderControls(t, myBookings);
    }
  } catch (err) {
    console.error('loadTours error', err);
    container.innerHTML = `<div class="error">Ошибка загрузки туров: ${err.status || 'network'} — ${JSON.stringify(err.body)}</div>`;
  }
}

function findBookingForTour(myBookings, tour) {
  for (const b of myBookings || []) {
    if (b.tour_id === tour.id) return b;
    if (b.tour_title === tour.title) return b;
    if (b.schedule && b.schedule.tour_id === tour.id) return b;
  }
  return null;
}

async function renderControls(tour, myBookings) {
  const root = document.getElementById('controls-' + tour.id);
  const formEl = document.getElementById('booking-form-' + tour.id);
  const msgEl = document.getElementById('msg-' + tour.id);
  root.innerHTML = '';
  formEl.innerHTML = '';
  msgEl.innerHTML = '';

  if (role === 'client' || role === 'guest') {
    try {
      const schedules = await apiFetch(`/api/schedules/tour/${tour.id}`);
      if (!schedules || schedules.length === 0) {
        root.innerHTML = '<div class="small">Нет доступных дат</div>';
        return;
      }

      const existing = findBookingForTour(myBookings, tour);
      if (existing) {
        const bookingInfo = document.createElement('div');
        bookingInfo.className = 'booking-details';
        bookingInfo.innerHTML = `
          <strong>Ваше бронирование:</strong><br>
          Дата: ${new Date(existing.start_datetime).toLocaleString()}<br>
          Участников: ${existing.participants_count}<br>
          Статус: ${existing.status}
        `;
        root.appendChild(bookingInfo);

        const btnCancel = document.createElement('button');
        btnCancel.className = 'btn btn-danger';
        btnCancel.textContent = 'Отменить бронь';
        btnCancel.onclick = async () => {
          msgEl.innerHTML = '';
          try {
            await apiFetch(`/api/bookings/${existing.id}`, { method: 'DELETE' });
            msgEl.innerHTML = `<div class="success">Бронь отменена</div>`;
            await loadTours();
          } catch (e) {
            msgEl.innerHTML = `<div class="error">Ошибка: ${e.status} ${JSON.stringify(e.body)}</div>`;
          }
        };
        root.appendChild(btnCancel);
      } else {
        const btnShowForm = document.createElement('button');
        btnShowForm.className = 'btn btn-primary';
        btnShowForm.textContent = 'Забронировать тур';
        btnShowForm.onclick = () => showBookingForm(tour, schedules);
        root.appendChild(btnShowForm);
      }
    } catch (err) {
      root.innerHTML = `<div class="error">Не удалось загрузить даты: ${err.status} — ${JSON.stringify(err.body)}</div>`;
    }
  }

  if (role === 'operator' || role === 'admin') {
    const btnEdit = document.createElement('button');
    btnEdit.className = 'btn btn-ghost';
    btnEdit.textContent = 'Редактировать';
    btnEdit.onclick = () => openEditTourForm(tour);
    const btnSched = document.createElement('button');
    btnSched.className = 'btn btn-ghost';
    btnSched.textContent = 'Управлять расписанием';
    btnSched.onclick = () =>
      (location.href = `/schedules_admin.html?tour=${tour.id}`);
    const btnDel = document.createElement('button');
    btnDel.className = 'btn btn-danger';
    btnDel.textContent = 'Удалить';
    btnDel.onclick = async () => {
      if (!confirm('Удалить тур?')) return;
      try {
        await apiFetch(`/api/tours/${tour.id}`, { method: 'DELETE' });
        await loadTours();
      } catch (e) {
        msgEl.innerHTML = `<div class="error">Ошибка: ${e.status} ${JSON.stringify(e.body)}</div>`;
      }
    };
    root.append(btnEdit, btnSched, btnDel);
  }
}

function showBookingForm(tour, schedules) {
  const formEl = document.getElementById('booking-form-' + tour.id);
  formEl.innerHTML = `
    <h4>Бронирование: ${escapeHtml(tour.title)}</h4>
    <div class="form-group">
      <label for="schedule-${tour.id}">Выберите дату:</label>
      <select id="schedule-${tour.id}">
        ${schedules
          .map(
            (s) => `
          <option value="${s.id}" data-price="${s.price_override || tour.base_price}" data-slots="${s.available_slots}">
            ${new Date(s.start_datetime).toLocaleString()} - ${s.available_slots} мест - ${s.price_override || tour.base_price} руб.
          </option>`
          )
          .join('')}
      </select>
    </div>
    <div class="form-group">
      <label for="participants-${tour.id}">Количество участников:</label>
      <input type="number" id="participants-${tour.id}" min="1" value="1" onchange="updateTotalPrice(${tour.id})">
    </div>
    <div class="form-group">
      <label for="requests-${tour.id}">Особые пожелания (необязательно):</label>
      <textarea id="requests-${tour.id}" placeholder="Ваши пожелания..."></textarea>
    </div>
    <div class="form-group">
      <strong>Общая стоимость: <span id="total-price-${tour.id}">${tour.base_price}</span> руб.</strong>
    </div>
    <div style="display:flex;gap:8px;margin-top:12px">
      <button class="btn btn-primary" onclick="submitBooking(${tour.id})">Подтвердить бронирование</button>
      <button class="btn btn-ghost" onclick="hideBookingForm(${tour.id})">Отмена</button>
    </div>
  `;
  formEl.classList.remove('hidden');
  updateTotalPrice(tour.id);
}

function hideBookingForm(tourId) {
  const formEl = document.getElementById('booking-form-' + tourId);
  formEl.classList.add('hidden');
  formEl.innerHTML = '';
}

function updateTotalPrice(tourId) {
  const scheduleSelect = document.getElementById('schedule-' + tourId);
  const participantsInput = document.getElementById('participants-' + tourId);
  const totalPriceEl = document.getElementById('total-price-' + tourId);

  const selectedOption = scheduleSelect.options[scheduleSelect.selectedIndex];
  const pricePerPerson = parseFloat(selectedOption.getAttribute('data-price'));
  const participants = parseInt(participantsInput.value) || 1;
  const availableSlots = parseInt(selectedOption.getAttribute('data-slots'));

  if (participants > availableSlots) {
    participantsInput.style.borderColor = '#dc3545';
    totalPriceEl.innerHTML = `<span style="color:#dc3545">Недостаточно мест (доступно: ${availableSlots})</span>`;
    return;
  } else {
    participantsInput.style.borderColor = '#ccc';
  }

  const totalPrice = pricePerPerson * participants;
  totalPriceEl.textContent = totalPrice;
}

async function submitBooking(tourId) {
  const scheduleSelect = document.getElementById('schedule-' + tourId);
  const participantsInput = document.getElementById('participants-' + tourId);
  const requestsInput = document.getElementById('requests-' + tourId);
  const msgEl = document.getElementById('msg-' + tourId);
  const formEl = document.getElementById('booking-form-' + tourId);

  const schedule_id = scheduleSelect.value;
  const participants_count = parseInt(participantsInput.value) || 1;
  const special_requests = requestsInput.value.trim();

  const selectedOption = scheduleSelect.options[scheduleSelect.selectedIndex];
  const availableSlots = parseInt(selectedOption.getAttribute('data-slots'));

  if (participants_count > availableSlots) {
    msgEl.innerHTML = `<div class="error">Недостаточно свободных мест. Доступно: ${availableSlots}</div>`;
    return;
  }

  msgEl.innerHTML = '<div>Создание бронирования...</div>';

  try {
    await apiFetch('/api/bookings', {
      method: 'POST',
      body: JSON.stringify({ schedule_id, participants_count, special_requests }),
    });

    msgEl.innerHTML = `<div class="success">Бронирование успешно создано!</div>`;
    formEl.classList.add('hidden');
    formEl.innerHTML = '';
    setTimeout(loadTours, 1000);
  } catch (e) {
    msgEl.innerHTML = `<div class="error">Ошибка при бронировании: ${e.status} — ${JSON.stringify(e.body)}</div>`;
  }
}

async function openEditTourForm(tour) {
  let guides = [];
  try {
    guides = await apiFetch('/api/guides');
  } catch (e) {
    console.warn('Не удалось загрузить гидов:', e);
  }

  const overlay = document.createElement('div');
  Object.assign(overlay.style, {
    position: 'fixed',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.4)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  });

  const guideOptions = guides
    .map(
      (g) =>
        `<option value="${g.id}" ${tour?.guide_id === g.id ? 'selected' : ''}>${escapeHtml(g.full_name)}</option>`
    )
    .join('');

  const box = document.createElement('div');
  Object.assign(box.style, {
    background: '#fff',
    padding: '18px',
    borderRadius: '10px',
    width: '520px',
  });

  box.innerHTML = `
    <h3>${tour ? 'Редактировать тур' : 'Добавить тур'}</h3>
    <label>Название<br><input id="f_title" style="width:100%" value="${escapeHtml(tour?.title || '')}"></label><br>
    <label>Описание<br><textarea id="f_desc" style="width:100%">${escapeHtml(tour?.description || '')}</textarea></label><br>
    <div style="display:flex;gap:8px">
      <label style="flex:1">Цена<br><input id="f_price" type="number" step="0.01" value="${tour?.base_price || 0}"></label>
      <label style="flex:1">Мест<br><input id="f_max" type="number" value="${tour?.max_participants || 10}"></label>
    </div>
    <label>Гид<br>
      <select id="f_guide" style="width:100%;padding:8px;border-radius:4px;border:1px solid #ccc">
        <option value="">-- Без гида --</option>
        ${guideOptions}
      </select>
    </label><br>
    <label>Локация<br><input id="f_loc" style="width:100%" value="${escapeHtml(tour?.location || '')}"></label><br>
    <label>Место встречи<br><input id="f_meet" style="width:100%" value="${escapeHtml(tour?.meeting_point || '')}"></label><br>
    <div style="margin-top:8px;text-align:right">
      <button id="saveBtn" class="btn btn-primary">${tour ? 'Сохранить' : 'Создать'}</button>
      <button id="cancelBtn" class="btn btn-ghost">Отмена</button>
    </div>
  `;

  overlay.appendChild(box);
  document.body.appendChild(overlay);

  document.getElementById('cancelBtn').onclick = () => overlay.remove();
  document.getElementById('saveBtn').onclick = async () => {
    const body = {
      title: document.getElementById('f_title').value,
      description: document.getElementById('f_desc').value,
      base_price: parseFloat(document.getElementById('f_price').value) || 0,
      max_participants: parseInt(document.getElementById('f_max').value) || 1,
      guide_id: document.getElementById('f_guide').value || null,
      location: document.getElementById('f_loc').value,
      meeting_point: document.getElementById('f_meet').value,
    };

    try {
      if (tour) {
        await apiFetch(`/api/tours/${tour.id}`, {
          method: 'PUT',
          body: JSON.stringify(body),
        });
      } else {
        await apiFetch('/api/tours', {
          method: 'POST',
          body: JSON.stringify(body),
        });
      }
      overlay.remove();
      await loadTours();
    } catch (e) {
      alert('Ошибка: ' + (e.status || 'network') + ' ' + JSON.stringify(e.body));
    }
  };
}

document.getElementById('btnAddTour').onclick = () => openEditTourForm(null);

function escapeHtml(s) {
  if (!s) return '';
  return s.replace(/[&<>"']/g, (m) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[m]));
}

loadTours();