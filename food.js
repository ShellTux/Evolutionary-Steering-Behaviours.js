class Food {
  constructor(x, y) {
    this.position = createVector(x, y);
  }
}

class Poison extends Food {
  constructor(x, y) {
    super(x, y);
  }
}