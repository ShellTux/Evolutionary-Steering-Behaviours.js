class Vehicle {
  constructor(x, y, dna) {
    this.acceleration = createVector();
    this.velocity = Vector.random2D().setMag(5);
    this.position = createVector(x, y);
    this.r = 6;
    this.maxSpeed = 6;
    this.maxForce = 0.1;
    this.health = 1;
    this.age = 0;
    //Reproductive System
    this.mature = false;
    this.mate = null;
    // setTimeout(() => this.mature = true, 1000 * 10);
    if (dna) {
      this.dna = dna.valueOf();
      //Mutate
      for (let i = 0; i < this.dna.length; i++) this.dna[i].value = Math.random() < 0.1 ?
        (this.dna[i].normalized + random(-0.1, 0.1)) * this.dna[i].mag :
        this.dna[i].value;
    } else {
      this.dna = [];
      //Food Weight
      this.dna[0] = {
        normalized: random(-1, 1),
        mag: 5
      };
      //Poison Weight
      this.dna[1] = {
        normalized: random(-1, 1),
        mag: 5
      };
      //Food Perception
      this.dna[2] = {
        normalized: random(0.01, 1),
        mag: 100
      };
      //Poison Perception
      this.dna[3] = {
        normalized: random(0.01, 1),
        mag: 100
      };
      for (let i = 0; i < this.dna.length; i++) this.dna[i].value = this.dna[i].normalized * this.dna[i].mag;
    };
  }

  show() {
    this.health = constrain(this.health, 0, 1);
    // Color based on health
    let col = rgb((1 - this.health) * 255, this.health * 255, 0);
    // Draw a triangle rotated in the direction of velocity
    let theta = this.velocity.heading() + Math.PI / 2;
    ctx.save();
    ctx.translate(this.position.x, this.position.y);
    ctx.rotate(theta);

    if (debug.checked) {

      // Circle and line for food
      ctx.strokeStyle = rgb(0, 255, 0);
      ctx.ellipse(0, 0, this.dna[2].value * 2, this.dna[2].value * 2, false);
      ctx.line(0, 0, 0, -this.dna[0].value * 25);

      // Circle and line for poison
      ctx.strokeStyle = rgb(255, 0, 0);
      ctx.ellipse(0, 0, this.dna[3].value * 2, this.dna[3].value * 2, false);
      ctx.line(0, 0, 0, -this.dna[1].value * 25);
    }

    ctx.fillStyle = col;
    ctx.strokeStyle = col;
    ctx.beginPath();
    ctx.moveTo(0, -this.r * 2);
    ctx.lineTo(-this.r, this.r * 2);
    ctx.lineTo(this.r, this.r * 2);
    ctx.lineTo(0, -this.r * 2);
    ctx.fill();
    ctx.closePath();
    ctx.restore();
  }

  move() {
    //Update Velocity
    this.velocity.add(this.acceleration);
    //Limits The Velocity
    this.velocity.constrain(this.maxSpeed);
    //Moves The Vehicle
    this.position.add(this.velocity);
    //Reset The Acceleration
    this.acceleration.mult(0);
    this.boundaries();
  }

  boundaries() {
    let d = this.maxSpeed - 1;
    let desired = null;
    if (this.position.x < d) {
      desired = createVector(this.maxspeed, this.velocity.y);
    } else if (this.position.x > cv.width - d) {
      desired = createVector(-this.maxspeed, this.velocity.y);
    }

    if (this.position.y < d) {
      desired = createVector(this.velocity.x, this.maxspeed);
    } else if (this.position.y > cv.height - d) {
      desired = createVector(this.velocity.x, -this.maxspeed);
    }
    if (desired !== null) {
      desired.setMag(this.maxSpeed);
      // let steer = Vector.subtract(desired, this.velocity);
      // steer.constrain(this.maxForce);
      let steer = Vector.subtract(createVector(cv.width * 0.5, cv.height * 0.5), this.position);
      this.applyForce(steer);
    }
  }

  seek(target) {
    //The Desired Force
    let desired = Vector.subtract(target, this.position);
    desired.setMag(this.maxSpeed);
    let steer = Vector.subtract(desired, this.velocity);
    steer.constrain(this.maxForce);
    return steer;
  }

  applyForce(force) {
    this.acceleration.add(force);
  }

  eat(list, nutrition, perception) {
    let closest = null;
    let record = Infinity;
    for (let i = list.length - 1; i >= 0; i--) {
      let d = Math.dist(this.position.x, this.position.y, list[i].x, list[i].y);

      if (d < this.maxSpeed) {
        list.splice(i, 1);
        this.health += nutrition;
      } else if (d < record && d < perception) {
        record = d;
        closest = list[i];
      }
    }
    if (closest !== null) return this.seek(closest);
    return createVector();
  }

  death() {
    return this.health <= 0 || this.age > 70;
  }

  steeringBehaviour(good, bad) {
    if (this.mate === null) {
      let steerG = this.eat(good, 1, this.dna[2].value);
      let steerB = this.eat(bad, -0.5, this.dna[3].value);

      steerG.mult(this.dna[0].value);
      steerB.mult(this.dna[1].value);

      this.applyForce(steerG);
      this.applyForce(steerB);
    } else {
      let sex = this.steer(this.mate);
      this.applyForce(sex);
      if (Math.dist(this.position.x, this.position.y, this.mate.position.x, this.mate.position.y) < 5) {
        this.health = 0;
        this.mate.health = 0;
      }
    }
  }

  clone() {
    if (this.age > 10) return new Vehicle(this.position.x + random(-5, 5), this.position.y + random(-5, 5), this.dna);
  }

  update() {
    this.show();
    this.move();
    this.health -= 0.01;
    this.age += 0.01;
    // this.health = constrain(this.health, 0, 1);
  }
};

// setInterval(() => reproduce(vehicles), 1000);

// const reproduce = function(list) {
//   for (let i = 0; i < list.length; i++) {
//     if (list[i].mature) {
//       for (let j = 0; j < list.length; j++) {
//         if (i === j) continue;
//         if (list[j].mature) {
//           list[i].mate = list[j];
//           list[j].mate = list[i];
//         }
//       }
//     }
//   }
//   // console.log(list);
// }