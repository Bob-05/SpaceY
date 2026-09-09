class User {
  constructor(name) {
    this.name = name;
  }
  sayHi() {
    return `Привет, ${this.name}`;
  }

  sayBy() {
    return `Пока, ${this.name}`
  }
}

const user = new User('Иван');

console.log(user.sayHi());
console.log(user.sayBy())
