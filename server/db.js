// ===== Подключение к базе данных MySQL =====
// Используется mysql2/promise — запросы выполняются через async/await
// (как требуется в практической работе №10).
const mysql = require("mysql2/promise");

const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "111",
    database: "spacey",
    port: 3306,
    waitForConnections: true,
    connectionLimit: 10,
    charset: "utf8mb4_unicode_ci"
});

module.exports = pool;