const express = require("express");
const path = require("path");

const app = express();
const db = require("./db");
const PORT = 3000;

app.use(express.json());

//HTTP - методы

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "visual.html"));
});

app.get("/users", (req, res) => {
    db.query("SELECT * FROM users", (err, results) => {
        if(err) {
            return res.status(500).json({error: err.message});
        }
        res.json(results);
    });
});

app.get("/users/:series", (req, res) => {
    const seriesParam = req.params.series;

    const sql = `
        SELECT u.*, p.series, p.number 
        FROM users u
        JOIN passports p ON u.id = p.Users_id
        WHERE p.series LIKE ?
    `;

    db.query(sql, [`${seriesParam}%`], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});




app.listen(PORT, () => {
    console.log('Работает');
});