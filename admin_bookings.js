const token = localStorage.getItem('token'); 
if(!token) location.href='/';

document.getElementById('logoutBtn').onclick = () => {
  localStorage.removeItem('token');
  location.href='/';
};

async function load() {
  try {
    const res = await fetch('/api/bookings', {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    const data = await res.json();
    const tb = document.getElementById('tb'); 
    tb.innerHTML = '';

    if (!data.length) {
      tb.innerHTML = '<tr><td colspan="8">Бронирования отсутствуют</td></tr>';
      return;
    }

    data.forEach(b => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${b.id}</td>
        <td>${b.user_name || b.first_name + ' ' + b.last_name}</td>
        <td>${b.tour_title}</td>
        <td>${b.start_datetime}</td>
        <td>${b.participants_count}</td>
        <td>${b.total_price}</td>
        <td>${b.status}</td>
        <td>
          <button class="ok" onclick="updateStatus(${b.id},'confirmed')">Подтвердить</button>
          <button class="rej" onclick="updateStatus(${b.id},'rejected')">Отклонить</button>
          <button class="del" onclick="del(${b.id})">Удалить</button>
        </td>
      `;
      tb.appendChild(tr);
    });
  } catch(e) {
    const tb = document.getElementById('tb');
    tb.innerHTML = `<tr><td colspan="8" style="color:red">Ошибка загрузки: ${e.message || e}</td></tr>`;
  }
}

async function updateStatus(id, status) {
  try {
    await fetch(`/api/bookings/${id}/status`, {
      method: 'PUT',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status })
    });
    load();
  } catch(e) {
    alert('Ошибка: ' + (e.message || e));
  }
}

async function del(id) {
  if(!confirm('Удалить бронь?')) return;
  try {
    await fetch('/api/bookings/' + id, {
      method: 'DELETE',
      headers: { 'Authorization': 'Bearer ' + token }
    });
    load();
  } catch(e) {
    alert('Ошибка: ' + (e.message || e));
  }
}

document.addEventListener('DOMContentLoaded', load);