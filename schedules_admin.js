const token = localStorage.getItem('token');
if(!token) location.href='/';

function parseJwt(t){ try{return JSON.parse(atob(t.split('.')[1]));}catch(e){return{}} }
const user = parseJwt(token);
const params = new URLSearchParams(location.search);
const tourFilter = params.get('tour') || '';

document.getElementById('back').onclick = ()=> location.href = '/tours.html';
document.getElementById('logout').onclick = ()=> { localStorage.removeItem('token'); location.href='/' };

async function apiFetch(url, opts={}) {
  opts.headers = opts.headers || {};
  if(token) opts.headers['Authorization'] = 'Bearer ' + token;
  if(opts.body && !opts.headers['Content-Type']) opts.headers['Content-Type'] = 'application/json';
  try {
    const res = await fetch(url, opts);
    const text = await res.text();
    let data;
    try { data = text ? JSON.parse(text) : null; } catch(e) { data = text; }
    if(!res.ok) throw {status:res.status, body:data};
    return data;
  } catch(e) {
    if(e instanceof TypeError) throw {status:0, body:e.message};
    throw e;
  }
}

async function load() {
  document.getElementById('info').innerText = tourFilter ? `Тур = ${tourFilter}` : 'Все расписания';
  const url = tourFilter ? `/api/schedules/tour/${tourFilter}` : '/api/schedules';
  try {
    const data = await apiFetch(url);
    const tb = document.getElementById('tb'); tb.innerHTML = '';
    if(!data.length){ tb.innerHTML = '<tr><td colspan="8">Расписания отсутствуют</td></tr>'; return; }
    data.forEach(s=>{
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${s.id}</td>
        <td>${s.tour_id}</td>
        <td>${s.start_datetime}</td>
        <td>${s.end_datetime}</td>
        <td>${s.available_slots}</td>
        <td>${s.price_override ?? '-'}</td>
        <td>${s.status}</td>
        <td>
          <button class="edit" onclick="showEdit(${s.id})">Редакт</button>
          <button class="del" onclick="del(${s.id})">Удалить</button>
        </td>`;
      tb.appendChild(tr);
    });
  } catch(e) {
    document.getElementById('tb').innerHTML = `<tr><td colspan="8" class="error">Ошибка загрузки: ${e.status} ${JSON.stringify(e.body)}</td></tr>`;
  }
}

function showForm(html) {
  const el = document.getElementById('formArea');
  el.style.display='block';
  el.innerHTML = html;
}

function hideForm(){ const el=document.getElementById('formArea'); el.style.display='none'; el.innerHTML=''; }

function showAdd(){
  showForm(`<h3>Добавить сеанс</h3>
  <label>Tour ID<br><input id="f_tour" value="${tourFilter}"></label><br>
  <label>Start<br><input id="f_start" type="datetime-local"></label><br>
  <label>End<br><input id="f_end" type="datetime-local"></label><br>
  <label>Slots<br><input id="f_slots" type="number" value="10"></label><br>
  <label>Price<br><input id="f_price" type="number" step="0.01"></label><br>
  <div style="margin-top:8px">
    <button class="add" onclick="saveNew()">Сохранить</button>
    <button onclick="hideForm()">Отмена</button>
  </div>`);
}

async function saveNew(){
  const body = {
    tour_id: parseInt(document.getElementById('f_tour').value),
    start_datetime: document.getElementById('f_start').value.replace('T',' '),
    end_datetime: document.getElementById('f_end').value.replace('T',' '),
    available_slots: parseInt(document.getElementById('f_slots').value),
    price_override: parseFloat(document.getElementById('f_price').value)||null
  };
  try { await apiFetch('/api/schedules', { method:'POST', body: JSON.stringify(body) }); hideForm(); load(); }
  catch(e){ alert('Ошибка: '+(e.status||'network')+' '+JSON.stringify(e.body)) }
}

async function showEdit(id){
  try {
    const s = await apiFetch('/api/schedules/'+id);
    showForm(`<h3>Редактировать #${id}</h3>
      <label>Tour ID<br><input id="f_tour" value="${s.tour_id}"></label><br>
      <label>Start<br><input id="f_start" type="datetime-local" value="${s.start_datetime.replace(' ','T')}"></label><br>
      <label>End<br><input id="f_end" type="datetime-local" value="${s.end_datetime.replace(' ','T')}"></label><br>
      <label>Slots<br><input id="f_slots" type="number" value="${s.available_slots}"></label><br>
      <label>Price<br><input id="f_price" type="number" step="0.01" value="${s.price_override||''}"></label><br>
      <div style="margin-top:8px">
        <button onclick="saveEdit(${id})">Сохранить</button>
        <button onclick="hideForm()">Отмена</button>
      </div>`);
  } catch(e){ alert('Ошибка загрузки: '+(e.status||'network')+' '+JSON.stringify(e.body)) }
}

async function saveEdit(id){
  const body = {
    tour_id: parseInt(document.getElementById('f_tour').value),
    start_datetime: document.getElementById('f_start').value.replace('T',' '),
    end_datetime: document.getElementById('f_end').value.replace('T',' '),
    available_slots: parseInt(document.getElementById('f_slots').value),
    price_override: parseFloat(document.getElementById('f_price').value)||null
  };
  try { await apiFetch('/api/schedules/'+id, { method:'PUT', body: JSON.stringify(body) }); hideForm(); load(); }
  catch(e){ alert('Ошибка сохранения: '+(e.status||'network')+' '+JSON.stringify(e.body)) }
}

async function del(id){
  if(!confirm('Удалить?')) return;
  try { await apiFetch('/api/schedules/'+id, { method:'DELETE' }); load(); }
  catch(e){ alert('Ошибка: '+(e.status||'network')+' '+JSON.stringify(e.body)) }
}

document.addEventListener('DOMContentLoaded', ()=>{
  const addBtn = document.createElement('button'); 
  addBtn.className='btn add'; 
  addBtn.innerText='Добавить сеанс';
  addBtn.onclick = ()=> showAdd();
  document.body.insertBefore(addBtn, document.getElementById('formArea'));
  load();
});