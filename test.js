class User {
  constructor(name) {
    this.name = name;
  }
  sayHi() {
    return `Привет, ${this.name}`;
  }
}

const user = new User('Иван');
