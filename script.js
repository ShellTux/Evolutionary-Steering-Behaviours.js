let cv, ctx;
let vehicles = [];
let foods = [];
let poison = [];
let debug;
let player;
let label;
let startPopulation = 100;
let startFood = 50;
let startPoison = 50;
let interval = 20;

const setup = function() {
  cv = document.querySelector('canvas');
  ctx = cv.getContext('2d');
  background(cv, 'black');
  debug = document.getElementById('debug');
  player = document.getElementById('player')
  label = document.getElementById('sliderLabel');
  player.onchange = () => {
    interval = 20 / player.value;
    label.innerHTML = `${player.value} x`;
  }
  for (let i = 0; i < startPopulation; i++) {
    vehicles.push(new Vehicle(Math.random() * cv.width, Math.random() * cv.height));
  }
  for (let i = 0; i < startFood; i++) {
    foods.push(createVector(Math.random() * cv.width, Math.random() * cv.height));
  }
  for (let i = 0; i < startPoison; i++) {
    poison.push(createVector(Math.random() * cv.width, Math.random() * cv.height));
  }
  draw();
}

window.onload = setup;

const draw = function() {
  background(cv, 'black');
  //Spawn Food with 15% chance
  if (Math.random() < 0.15) foods.push(createVector(Math.random() * cv.width, Math.random() * cv.height));
  //Spawn Poison with 1% chance
  if (Math.random() < 0.20) poison.push(createVector(Math.random() * cv.width, Math.random() * cv.height));
  if (poison.length > 500) poison.splice(Math.randInt(poison.length - 1), 1);

  // vehicles = vehicles.filter(vehicle => !vehicle.death());
  for (let i = vehicles.length - 1; i >= 0; i--) {
    if (vehicles[i].death()) {
      if (Math.random() < 1) foods.push(vehicles[i].position.copy());
      vehicles.splice(i, 1);
    }
  }

  //Show Foods
  ctx.fillStyle = rgb(10, 200, 10);
  foods.forEach(food => ctx.ellipse(food.x, food.y, 10));

  //Show Poison
  ctx.fillStyle = 'red';
  poison.forEach(poison => ctx.ellipse(poison.x, poison.y, 10));

  //Show Vehicles and Behave with objects
  vehicles.forEach(vehicle => {
    vehicle.update();
    vehicle.steeringBehaviour(foods, poison);
    let newVehicle1 = vehicle.clone();
    let newVehicle2 = vehicle.clone();
    if (newVehicle1) {
      vehicle.health = 0;
      vehicles.push(newVehicle1, newVehicle2);
    }
  });
  label.innerHTML = `${player.value} x      Nº Animals: ${vehicles.length}.`;
  setTimeout(draw, interval);
}