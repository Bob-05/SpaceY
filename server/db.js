const mysql = require("mysql2");

const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "111",
    database: "spacey",
    port: 3306
});

connection.connect((err) => {
    if(err){
        console.error("Error connect: ", err.message);
        return;
    }
    console.log("Connect to db");
});


module.exports = connection;