// 1
const name = 'Иван';
let age = 20;
let city = 'Москва';

console.log('Пользователь: ', name);
console.log('Возраст: ', age);
console.log('Город: ', city);

// 2
if (age >= 16) {
	console.log('Вход разрешён');
}
else {
	console.log('Вход запрещён');
}

// 3
const products = ['Хлеб', 'Молоко', 'Яблоки', 'БананЫ', 'Морковь'];
for (let i = 0; i < products.length; i++) { 
  console.log(i + 1 + '. ' + products[i]); 
}

// 4
const items = ['Xiaomi SU7', 'Компьютерный стул'];
items.push('Клавиатура');
console.log('Обновленный список: ', items); 

// 5
const prices = [150, 300, 450, 800];
const new_prices = prices.map(price => price + ((price / 100) * 20));
console.log('Старые цены: ', prices, '\nНовые цены: ', new_prices);

// 6
const goods = ["Ноутбук", "Мышь", "Клавиатура", "Монитор"];
console.log('Найденный товар: ', goods.find(item => item === 'Монитор'));

// 7
const student = {
  name: 'Данко',
  group: 'ОС-55',
  course: '5'
};

for (const key in student) {
  console.log(key, ': ', student[key]);
}

// 8
const student_2 = {
  name: 'Анна',
  grade: 4
};

student_2.attendance = '100%';
console.log(student_2);

// 9
function calculateOrder (price, number) {
  return price * number;
}

console.log(calculateOrder(500, 3));

// 10
const items2 = [
  {name: 'Клавиатура', price: 3199},
  {name: 'Адаптер 240Вт', price: 5250},
  {name: 'Монитор 160HZ', price: 10000},
  {name: 'Настольная лампа', price: 1500},
  {name: 'Apple Iphone 15Pro max', price: 65000}
];

for (const item of items2) {
  console.log('Наименование товара: ', item.name, ', Цена: ', item.price);
}

// 11
const employees = [
  {
    name: "Александр Петров",
    position: "Frontend-разработчик",
    salary: 75000
  },
  {
    name: "Мария Сидорова",
    position: "UI/UX Дизайнер",
    salary: 95000
  },
  {
    name: "Дмитрий Иванов",
    position: "QA-инженер",
    salary: 85000
  },
  {
    name: "Елена Смирнова",
    position: "Project Manager",
    salary: 140000
  }
];

console.log(employees.filter(emp => emp.salary > 70000));
