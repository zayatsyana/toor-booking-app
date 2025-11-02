const app = require('./app');
const pool = require('./config/database');
require('dotenv').config();

const PORT = process.env.PORT || 3000;

(async () => {
  try {
    const conn = await pool.getConnection();
    console.log('БД подключена успешно');
    conn.release();

    app.listen(PORT, () => console.log(`Сервер запущен: http://localhost:${PORT}`));
  } catch (error) {
    console.error('Ошибка соединения с БД', error.message);
  }
})();
