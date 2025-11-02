const token = localStorage.getItem('token'); 
if(!token) location.href='/';

document.getElementById('logoutBtn').onclick = () => {
  localStorage.removeItem('token');
  location.href='/';
};

document.getElementById('btnAdd').onclick = showAdd;

async function load() {
  try {
    const res = await fetch('/api/guides', {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    const data = await res.json();
    const tb = document.getElementById('tb');
    tb.innerHTML = '';

    if(!data.length) {
      tb.innerHTML = '<tr><td colspan="7">Гиды отсутствуют</td></tr>';
      return;
    }

    data.forEach(g => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${g.id}</td>
        <td>${g.full_name}</td>
        <td>${g.experience_years}</td>
        <td>${g.languages || ''}</td>
        <td>${g.rating || ''}</td>
        <td>${g.active ?? ''}</td>
        <td>
          <button class="edit" onclick="edit(${g.id})">Редактировать</button>
          <button class="del" onclick="del(${g.id})">Удалить</button>
        </td>
      `;
      tb.appendChild(tr);
    });
  } catch(e) {
    const tb = document.getElementById('tb');
    tb.innerHTML = `<tr><td colspan="7" style="color:red">Ошибка загрузки: ${e.message || e}</td></tr>`;
  }
}

function showAdd() {
  const f = document.getElementById('form');
  f.style.display = 'block';
  f.innerHTML = `
    <h3>Добавить гида</h3>
    <input id="g_name" placeholder="ФИО"><br>
    <input id="g_exp" placeholder="Опыт (лет)"><br>
    <input id="g_lang" placeholder="Языки"><br>
    <input id="g_phone" placeholder="Тел"><br>
    <button onclick="saveNew()">Сохранить</button>
    <button onclick="hide()">Отмена</button>
  `;
}

function hide() {
  const f = document.getElementById('form');
  f.style.display = 'none';
  f.innerHTML = '';
}

async function saveNew() {
  const body = {
    full_name: document.getElementById('g_name').value,
    experience_years: parseInt(document.getElementById('g_exp').value) || 0,
    languages: document.getElementById('g_lang').value,
    phone: document.getElementById('g_phone').value
  };
  const res = await fetch('/api/guides', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if(res.ok) { hide(); load(); } else alert('Ошибка');
}

async function edit(id) {
  const r = await fetch('/api/guides/' + id, {
    headers: { 'Authorization': 'Bearer ' + token }
  });
  const g = await r.json();
  const f = document.getElementById('form');
  f.style.display = 'block';
  f.innerHTML = `
    <h3>Редактировать</h3>
    <input id="g_name" value="${g.full_name}"><br>
    <input id="g_exp" value="${g.experience_years}"><br>
    <input id="g_lang" value="${g.languages || ''}"><br>
    <input id="g_phone" value="${g.phone || ''}"><br>
    <button onclick="saveEdit(${id})">Сохранить</button>
    <button onclick="hide()">Отмена</button>
  `;
}

async function saveEdit(id) {
  const body = {
    full_name: document.getElementById('g_name').value,
    experience_years: parseInt(document.getElementById('g_exp').value) || 0,
    languages: document.getElementById('g_lang').value,
    phone: document.getElementById('g_phone').value
  };
  await fetch('/api/guides/' + id, {
    method: 'PUT',
    headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  hide(); load();
}

async function del(id) {
  if(!confirm('Удалить?')) return;
  await fetch('/api/guides/' + id, {
    method: 'DELETE',
    headers: { 'Authorization': 'Bearer ' + token }
  });
  load();
}

document.addEventListener('DOMContentLoaded', load);