// ============================================================
//  SpaceY — сервер на Express + MySQL (практическая работа №10)
//  Регистрация и авторизация пользователей + выгрузка данных
//  сайта из базы данных.
// ============================================================
const express = require("express");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const db = require("./db");

const app = express();
const PORT = 3000;

// Секрет для подписи JWT (в учебных целях хранится в коде)
const JWT_SECRET = "secretKey";

// Промежуточные обработчики
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Раздача статики проекта (index.html, pages/, assets/, scripts/)
const PROJECT_ROOT = path.join(__dirname, "..");
app.use(express.static(PROJECT_ROOT));

// ------------------ Вспомогательные функции ------------------

// $250000 -> $250K, $3500000 -> $3.5M
function formatPrice(value) {
    const v = Number(value);
    if (v >= 1000000) {
        const digits = (v / 1000000).toFixed(1).replace(/\.0$/, "");
        return "$" + digits + "M";
    }
    return "$" + Math.round(v / 1000) + "K";
}

// 3 -> "3 дня", 30 -> "30 дней", 21 -> "21 день"
function formatDuration(days) {
    const d = Number(days) || 0;
    const n = Math.abs(d) % 100;
    const last = n % 10;
    if (n >= 11 && n <= 14) return d + " дней";
    if (last === 1) return d + " день";
    if (last >= 2 && last <= 4) return d + " дня";
    return d + " дней";
}

// DATETIME -> "12.03.2026"
function formatDate(dt) {
    if (!dt) return "";
    const date = new Date(dt);
    if (isNaN(date.getTime())) return "";
    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    return dd + "." + mm + "." + date.getFullYear();
}

// Пользователь без пароля
function publicUser(u) {
    return {
        id: u.id,
        first_name: u.first_name,
        last_name: u.last_name,
        middle_name: u.middle_name,
        phone: u.phone,
        email: u.email
    };
}

// Ссылка на изображение -> абсолютный путь (для проверки существования файла)
function imageToPath(img) {
    return path.join(PROJECT_ROOT, img.replace(/\//g, path.sep));
}

// --------------------- ПРАКТИЧЕСКАЯ РАБОТА №10 ---------------------
// Регистрация пользователя
app.post("/register", async (req, res) => {
    const { first_name, last_name, middle_name, phone, email, password } = req.body;

    // Проверка обязательных полей (дополнительное задание)
    if (!first_name || !last_name || !email || !password) {
        return res.status(400).json({
            message: "Заполните все обязательные поля"
        });
    }

    try {
        // Проверяем, не зарегистрирован ли уже такой email
        const [users] = await db.query(
            "SELECT * FROM users WHERE email = ?",
            [email]
        );

        if (users.length > 0) {
            return res.status(400).json({
                message: "Пользователь с таким email уже существует"
            });
        }

        // Хешируем пароль (bcrypt, 10 раундов). В БД хранится ТОЛЬКО хеш.
        const hashedPassword = await bcrypt.hash(password, 10);

        await db.query(
            "INSERT INTO users (first_name, last_name, middle_name, phone, email, password) VALUES (?, ?, ?, ?, ?, ?)",
            [first_name, last_name, middle_name || null, phone || null, email, hashedPassword]
        );

        res.status(201).json({
            message: "Пользователь зарегистрирован"
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Ошибка сервера"
        });
    }
});

// Авторизация пользователя
app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            message: "Заполните все поля"
        });
    }

    try {
        const [users] = await db.query(
            "SELECT * FROM users WHERE email = ?",
            [email]
        );

        if (users.length === 0) {
            return res.status(404).json({
                message: "Пользователь не найден"
            });
        }

        const user = users[0];

        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            return res.status(400).json({
                message: "Неверный пароль"
            });
        }

        const token = jwt.sign(
            { id: user.id },
            JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.json({
            message: "Авторизация успешна",
            token: token,
            user: publicUser(user)
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Ошибка сервера"
        });
    }
});

// Получение всех пользователей (без паролей)
app.get("/users", async (req, res) => {
    try {
        const [users] = await db.query(
            "SELECT id, first_name, last_name, middle_name, phone, email FROM users"
        );
        res.json(users);
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Ошибка сервера"
        });
    }
});

// Получение пользователя по ID (без пароля)
app.get("/users/:id", async (req, res) => {
    try {
        const [users] = await db.query(
            "SELECT id, first_name, last_name, middle_name, phone, email FROM users WHERE id = ?",
            [req.params.id]
        );

        if (users.length === 0) {
            return res.status(404).json({
                message: "Пользователь не найден"
            });
        }

        res.json(users[0]);
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Ошибка сервера"
        });
    }
});

// Удаление пользователя
app.delete("/users/:id", async (req, res) => {
    try {
        const [result] = await db.query(
            "DELETE FROM users WHERE id = ?",
            [req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Пользователь не найден"
            });
        }

        res.json({
            message: "Пользователь удален"
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Ошибка сервера"
        });
    }
});

// Проверка JWT-токена для защищённых маршрутов.
// Клиент передаёт токен в заголовке: Authorization: Bearer <token>
function authenticateToken(req, res, next) {
    const header = req.headers["authorization"];
    const token = header && header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
        return res.status(401).json({ message: "Токен не предоставлен" });
    }

    jwt.verify(token, JWT_SECRET, (err, payload) => {
        if (err) {
            return res.status(403).json({ message: "Недействительный или просроченный токен" });
        }
        req.userId = payload.id;
        next();
    });
}

// Защищённый маршрут: данные текущего пользователя по JWT
app.get("/profile", authenticateToken, async (req, res) => {
    try {
        const [users] = await db.query(
            "SELECT id, first_name, last_name, middle_name, phone, email FROM users WHERE id = ?",
            [req.userId]
        );
        if (users.length === 0) {
            return res.status(404).json({ message: "Пользователь не найден" });
        }
        res.json(users[0]);
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Ошибка сервера"
        });
    }
});

// --------------------- ВЫГРУЗКА ДАННЫХ САЙТА ИЗ БД ---------------------

// Список маршрутов (карточки на главной, страница билетов, модалка)
app.get("/api/trips", async (req, res) => {
    try {
        const [trips] = await db.query("SELECT * FROM trips ORDER BY id_trip");

        const [inclRows] = await db.query(
            `SELECT iht.id_trip, i.name AS include_name
             FROM includes i
             JOIN includes_has_trips iht ON iht.id_include = i.id
             ORDER BY iht.id`
        );
        const includesByTrip = new Map();
        inclRows.forEach((r) => {
            if (!includesByTrip.has(r.id_trip)) includesByTrip.set(r.id_trip, []);
            includesByTrip.get(r.id_trip).push(r.include_name);
        });

        const [imgRows] = await db.query(
            "SELECT id_trip, path FROM images ORDER BY id"
        );
        const imagesByTrip = new Map();
        imgRows.forEach((r) => {
            if (!imagesByTrip.has(r.id_trip)) imagesByTrip.set(r.id_trip, []);
            imagesByTrip.get(r.id_trip).push(r.path);
        });

        const tripsList = trips.map((t) => ({
            slug: t.slug,
            title: t.title,
            price: Number(t.price),
            priceLabel: formatPrice(t.price) + " / место",
            duration: t.duration,
            durationLabel: formatDuration(t.duration),
            description: t.description,
            icon: t.icon,
            badge: t.badge,
            includes: includesByTrip.get(t.id_trip) || [],
            images: (imagesByTrip.get(t.id_trip) || []).filter((img) =>
                fs.existsSync(imageToPath(img))
            )
        }));

        res.json(tripsList);
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Ошибка сервера"
        });
    }
});

// Один маршрут по slug (для модального окна)
app.get("/api/trips/:slug", async (req, res) => {
    try {
        const [trips] = await db.query(
            "SELECT * FROM trips WHERE slug = ?",
            [req.params.slug]
        );
        if (trips.length === 0) {
            return res.status(404).json({ message: "Маршрут не найден" });
        }
        const t = trips[0];

        const [inclRows] = await db.query(
            `SELECT i.name AS include_name
             FROM includes i
             JOIN includes_has_trips iht ON iht.id_include = i.id
             WHERE iht.id_trip = ?
             ORDER BY iht.id`,
            [t.id_trip]
        );
        const [imgRows] = await db.query(
            "SELECT path FROM images WHERE id_trip = ? ORDER BY id",
            [t.id_trip]
        );

        res.json({
            slug: t.slug,
            title: t.title,
            price: Number(t.price),
            priceLabel: formatPrice(t.price) + " / место",
            duration: t.duration,
            durationLabel: formatDuration(t.duration),
            description: t.description,
            icon: t.icon,
            badge: t.badge,
            includes: inclRows.map((r) => r.include_name),
            images: imgRows.map((r) => r.path).filter((img) =>
                fs.existsSync(imageToPath(img))
            )
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Ошибка сервера"
        });
    }
});

// FAQ (аккордеон на странице поддержки)
app.get("/api/faq", async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT id, question, answer FROM FAQ_questions ORDER BY id"
        );
        res.json(rows.map((r) => ({ id: r.id, question: r.question, answer: r.answer })));
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Ошибка сервера"
        });
    }
});

// Отзывы
app.get("/api/reviews", async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT author_name, content, rating, created_at FROM reviews ORDER BY COALESCE(created_at, id_review) DESC"
        );
        res.json(rows.map((r) => ({
            author: r.author_name || "Космический турист",
            text: r.content,
            rating: r.rating,
            date: formatDate(r.created_at)
        })));
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Ошибка сервера"
        });
    }
});

// Добавление отзыва
app.post("/api/reviews", async (req, res) => {
    const { author, rating, text } = req.body;
    if (!author || !text || !rating) {
        return res.status(400).json({ message: "Заполните все поля" });
    }
    const value = parseInt(rating, 10);
    if (isNaN(value) || value < 1 || value > 5) {
        return res.status(400).json({ message: "Оценка должна быть от 1 до 5" });
    }
    try {
        await db.query(
            "INSERT INTO reviews (author_name, content, rating) VALUES (?, ?, ?)",
            [author, text, value]
        );
        res.status(201).json({ message: "Отзыв добавлен" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Ошибка сервера" });
    }
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Сервер запущен: http://localhost:${PORT}`);
});