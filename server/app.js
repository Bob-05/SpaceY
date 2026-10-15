const express = require("express");

const app = express();
const PORT = 3000;

app.use(express.json());

/*
Ресурсы - использую только массивы, т.к. пока по практической не требуется использования БД
*/

const cardData = require("../scripts/data.js");
let reviews = [


];




//HTTP - методы

app.get("/cardData", (req, res) => {
    res.status(200).json(cardData);


});


app.post("/reviews", (req, res) => {
    const {name, rating, description} = req.body;

    if (!name || !rating || rating <= 0 || rating > 5){
        return res.status(400).json({
            message: "Необходимо заполнить все поля"
        });
    }

    const new_review = {
         id: reviews.length + 1,
         name,
         rating,
         description
     };

     reviews.push(new_review);
     res.status(201).json(new_review);
});

app.put("/reviews/:id", (req, res) => {
    const review = reviews.find(
        p => p.id === Number(req.params.id)
    );

    if (!review) {
        return res.status(404).json({
            message: "Отзыв не найден"
        });
    }

    const { name, rating, description } = req.body;

    review.name = name;
    review.rating = rating;
    review.description = description;

    res.status(200).json(review);
});

app.delete("/reviews/:id", (req, res) => {
    const id = Number(req.params.id);

    const review = reviews.find(
        p => p.id === id
    );

    if (!review) {
        return res.status(404).json({
            message: "Отзыв не найден"
        });
    }

    reviews = reviews.filter(
        p => p.id !== id
    );

    res.status(200).json({
        message: "Отзыв успешно удалён"
    });
});




app.get("/reviews/:id", (req, res) => {
    const id = Number(req.params.id);

    const review = reviews.find(p => p.id === id);
    if (!review) {res.status(404).json({message: "Отзыв не найден"});}

    res.status(200).json(review);
});





app.listen(PORT, () => {
    console.log('Работает');
});