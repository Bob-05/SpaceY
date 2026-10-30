// ============================================================
//  server/seed.js — полный цикл подготовки базы данных SpaceY
//
//  1. Исправляет схему БД (устраняет несовместимости для
//     практической работы №10);
//  2. ОЧИЩАЕТ все таблицы от записей;
//  3. Переносит данные из script/*.js в БД:
//       - scripts/data.js     -> Trips, Images, Includes, Includes_has_Trips
//       - scripts/faq-data.js -> FAQ_questions
//  4. Загружает отзывы (раньше — статическая разметка reviews.html);
//  5. Создаёт демо-пользователя — в БД сохраняется ТОЛЬКО хеш bcrypt.
//
//  Запуск: node seed.js
// ============================================================
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcrypt");

const db = require("./db"); // mysql2/promise pool
const cardData = require("../scripts/data.js");
const { faqData } = require("../scripts/faq-data.js");

const PROJECT_ROOT = path.join(__dirname, "..");

// ---------- Метаданные карточек, которых нет в script/*.js ----------
const tripMeta = {
    moon:     { slug: "moon",     icon: "🌙", badge: "МАРШРУТ ГОТОВ" },
    mars:     { slug: "mars",     icon: "🔴", badge: "МАРШРУТ ГОТОВ" },
    saturn:   { slug: "saturn",   icon: "🪐", badge: "МАРШРУТ ГОТОВ" },
    hotel:    { slug: "hotel",    icon: "🌍", badge: "НОВИНКА" },
    asteroid: { slug: "asteroid", icon: "☄️", badge: "ЭКСКЛЮЗИВ" },
    titan:    { slug: "titan",    icon: "🚀", badge: "ПОПУЛЯРНЫЙ" }
};

// ---------- Отзывы (раньше были статикой в pages/reviews.html) ----------
const reviewsSeed = [
    { author: "Алексей Смирнов",    date: "2026-03-12", rating: 5, text: "Невероятное путешествие! Лунная база превзошла все ожидания. Обязательно вернусь на Марс!" },
    { author: "Екатерина Воронова", date: "2026-02-28", rating: 4, text: "Орбитальный отель — это что-то невероятное. Вид на Землю захватывает дух. Единственный минус — дороговато." },
    { author: "Дмитрий Кузнецов",   date: "2026-01-15", rating: 5, text: "Пролёт колец Сатурна — мечта всей жизни! Команда SpaceY сделала всё на высшем уровне. Рекомендую!" },
    { author: "Ольга Морозова",     date: "2025-12-03", rating: 5, text: "Экспедиция на Марс — это не просто тур, это настоящее приключение. Роверы, виды, атмосфера — всё супер!" },
    { author: "Михаил Волков",      date: "2025-11-18", rating: 4, text: "Отличный сервис! Всё организовано на высшем уровне. Немного не хватило времени на Луне, но это мелочи." },
    { author: "Анна Соколова",      date: "2025-10-05", rating: 5, text: "Потрясающий опыт! Вид на Землю из космоса — это не передать словами. Спасибо SpaceY за эту возможность!" }
];

// ---------- Демо-пользователь для проверки входа ----------
const demoUser = {
    first_name: "Иван",
    last_name: "Иванов",
    middle_name: "Иванович",
    phone: "79991112233",
    email: "ivanov@mail.ru",
    password: "123456"
};

// '$250K' -> 250000, '$3.5M' -> 3500000
function parsePrice(label) {
    const m = String(label).match(/\$(\d+(?:\.\d+)?)([KM])/);
    if (!m) return 0;
    const v = parseFloat(m[1]);
    return m[2] === "M" ? v * 1000000 : v * 1000;
}

// '3 дня' -> 3
function parseDuration(label) {
    const m = String(label).match(/(\d+)/);
    return m ? parseInt(m[1], 10) : 0;
}

// Оставляем только ссылки на реально существующие файлы
function existingImages(imgs) {
    return imgs.filter((p) =>
        fs.existsSync(path.join(PROJECT_ROOT, p.replace(/\//g, path.sep)))
    );
}

// ---------- Проверка/добавление колонок (идемпотентно) ----------
async function columnExists(table, column) {
    const [rows] = await db.query(
        `SELECT COUNT(*) AS n FROM information_schema.columns
         WHERE table_schema = DATABASE() AND table_name = ? AND column_name = ?`,
        [table, column]
    );
    return rows[0].n > 0;
}

async function addColumn(table, column, ddl) {
    if (!(await columnExists(table, column))) {
        await db.query(`ALTER TABLE \`${table}\` ADD COLUMN ${ddl}`);
        console.log(`  + колонка ${table}.${column}`);
    }
}

// ---------- Основной процесс ----------
(async () => {
    console.log("=== Подготовка БД SpaceY ===\n");

    // 1. Полная очистка всех таблиц
    const [tables] = await db.query("SHOW TABLES");
    const names = tables.map((t) => Object.values(t)[0]);
    await db.query("SET FOREIGN_KEY_CHECKS = 0");
    for (const name of names) {
        await db.query(`TRUNCATE TABLE \`${name}\``);
    }
    await db.query("SET FOREIGN_KEY_CHECKS = 1");
    console.log("Очищено таблиц:", names.length, "\n");

    // 2. Схема — исправление несовместимостей практической №10
    console.log("— Схема —");

    // Таблица users: пароль хранится ТОЛЬКО в виде хеша bcrypt
    await addColumn("users", "password",
        "`password` VARCHAR(255) NOT NULL DEFAULT '' AFTER `email`");
    await db.query("ALTER TABLE users MODIFY `middle_name` VARCHAR(50) NULL DEFAULT NULL");
    await db.query("ALTER TABLE users MODIFY `phone` CHAR(11) NULL DEFAULT NULL");

    // email должен быть уникальным (для проверки дубликатов при регистрации)
    const [idx] = await db.query(
        `SELECT COUNT(*) AS n FROM information_schema.statistics
         WHERE table_schema = DATABASE() AND table_name = 'users' AND index_name = 'email_UNIQUE'`
    );
    if (idx[0].n === 0) {
        await db.query("ALTER TABLE users ADD UNIQUE INDEX email_UNIQUE (email)");
        console.log("  + UNIQUE index users.email");
    }

    // Карточки маршрутов: slug, иконка и бейдж
    await addColumn("trips", "slug",  "`slug`  VARCHAR(50) NULL DEFAULT NULL");
    await addColumn("trips", "icon",  "`icon`  VARCHAR(10) NULL DEFAULT NULL");
    await addColumn("trips", "badge", "`badge` VARCHAR(30) NULL DEFAULT NULL");

    // Отзывы: автор и дата (для выгрузки страницы отзывов из БД)
    await addColumn("reviews", "author_name", "`author_name` VARCHAR(100) NULL DEFAULT NULL");
    await addColumn("reviews", "created_at", "`created_at` DATETIME NULL DEFAULT CURRENT_TIMESTAMP");

    // FAQ: новая таблица
    await db.query(
        `CREATE TABLE IF NOT EXISTS FAQ_questions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            question TEXT NOT NULL,
            answer TEXT NOT NULL
        ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci`
    );
    console.log("  + таблица FAQ_questions\n");

    // 3. Маршруты из scripts/data.js -> Trips / Images / Includes
    console.log("— Маршруты (scripts/data.js) —");
    for (const [key, trip] of Object.entries(cardData)) {
        const meta = tripMeta[key];
        if (!meta) continue;

        const price = parsePrice(trip.price);
        const days = parseDuration(trip.duration);
        const images = existingImages(trip.images);

        // Даты полёта: старт завтра, длительность trip.duration дней
        const start = new Date(Date.now() + 24 * 3600 * 1000);
        const end = new Date(start.getTime() + days * 24 * 3600 * 1000);
        const pad = (n) => String(n).padStart(2, "0");
        const fmt = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} 10:00:00`;

        const [res] = await db.query(
            `INSERT INTO trips
                (starting_point, end_point, start_data, end_data, description, price, title, duration, slug, icon, badge)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                "Космопорт SpaceY",
                trip.title,
                fmt(start),
                fmt(end),
                trip.description,
                price,
                trip.title.replace(/^\S+\s/, "").trim(), // убираем эмодзи из названия
                days,
                meta.slug,
                meta.icon,
                meta.badge
            ]
        );
        const tripId = res.insertId;

        // Изображения: в БД хранятся только ссылки на файлы из assets/images
        for (const img of images) {
            await db.query(
                "INSERT INTO images (path, descriptions, id_trip) VALUES (?, ?, ?)",
                [img, "Фотография маршрута", tripId]
            );
        }

        // Что включено (Includes + Includes_has_Trips)
        for (const inc of trip.includes) {
            const [rows] = await db.query("SELECT id FROM includes WHERE name = ?", [inc]);
            let includeId = null;
            if (rows.length > 0) {
                includeId = rows[0].id;
            } else {
                const [r2] = await db.query(
                    "INSERT INTO includes (name, descriptions) VALUES (?, ?)",
                    [inc, inc]
                );
                includeId = r2.insertId;
            }
            await db.query(
                "INSERT INTO includes_has_trips (id_trip, id_include) VALUES (?, ?)",
                [tripId, includeId]
            );
        }

        console.log(`  + ${meta.slug}: «${trip.title.replace(/^\S+\s/, "").trim()}» (${images.length} фото, ${trip.includes.length} включений)`);
    }

    // 4. FAQ из scripts/faq-data.js
    console.log("\n— FAQ (scripts/faq-data.js) —");
    for (const item of faqData) {
        await db.query(
            "INSERT INTO FAQ_questions (question, answer) VALUES (?, ?)",
            [item.question, item.answer]
        );
    }
    console.log(`  + ${faqData.length} вопросов`);

    // 5. Отзывы из reviews.html
    console.log("\n— Отзывы —");
    for (const r of reviewsSeed) {
        await db.query(
            "INSERT INTO reviews (author_name, content, rating, created_at) VALUES (?, ?, ?, ?)",
            [r.author, r.text, r.rating, r.date + " 10:00:00"]
        );
    }
    console.log(`  + ${reviewsSeed.length} отзывов`);

    // 6. Демо-пользователь (в БД — только хеш bcrypt)
    console.log("\n— Демо-пользователь —");
    const hashedPassword = await bcrypt.hash(demoUser.password, 10);
    await db.query(
        "INSERT INTO users (first_name, last_name, middle_name, phone, email, password) VALUES (?, ?, ?, ?, ?, ?)",
        [demoUser.first_name, demoUser.last_name, demoUser.middle_name, demoUser.phone, demoUser.email, hashedPassword]
    );
    console.log(`  + ${demoUser.email} (пароль «${demoUser.password}» сохранён как bcrypt-хеш)`);

    console.log("\n=== Готово. База данных очищена и наполнена из script/*.js ===");
    process.exit(0);
})().catch((error) => {
    console.error("\n!!! Ошибка:", error.message);
    process.exit(1);
});