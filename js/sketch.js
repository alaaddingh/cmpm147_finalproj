let img;
let cnv;
let fishData;
let fishArray = [];

/**
 * GLOBAL TANK VARIABLES
 */
const TANK = {
  x: () => width / 2,
  y: () => height / 2,
  w: () => width * .75,
  h: () => height * .95,
  left: () => TANK.x() - TANK.w() / 2,
  right: () => TANK.x() + TANK.w() / 2,
  top: () => TANK.y() - TANK.h() * 0.75 / 2,
  bottom: () => TANK.y() + TANK.h() * 0.65 / 2,
  usableWidth: () => TANK.w(),
  usableHeight: () => TANK.h() * 0.75
};

/**
 * processes fish JSON data
 *
 */
function loadfish() {
  if (!Array.isArray(fishData)) {
  fishData = Object.values(fishData);
}
  for (let i = 0; i < fishData.length; i++) {
    let f = fishData[i];
    /**
     *   ternary operator for fish json to determine traits
     */
    let traits = {
      speed: f.speed === "fast" ? random(2, 4) : f.speed === "slow" ? random(0.5, 1.5) : random(1, 2),
      finSize: f.finSize === "big" ? random(20, 30) : f.finSize === "small" ? random(5, 10) : random(10, 20),
      size: f.size === "big" ? random(50, 100) : f.size === "small" ? random(20, 40) : random(30, 60),
      color: color(f.color[0], f.color[1], f.color[2]),
      lifespan: f.lifespan === "long" ? random(5000, 10000) : f.lifespan === "short" ? random(2000, 4000) : random(3000, 6000)
    };
    let x = random(TANK.left() + traits.size / 2, TANK.right() - traits.size / 2);
    let y = random(TANK.top() + traits.size / 2, TANK.bottom() - traits.size / 2);
    fishArray.push(new Fish(x, y, traits));
  }
}

function preload() {
  img = loadImage('./assets/melvins_fishtank.png'); 
  fishData = loadJSON('./assets/fish.json');
  console.log(fishData);
}

function setup() {
  background(100);
  cnv = createCanvas(windowWidth, windowHeight);
  cnv.position(0, 0); 
  imageMode(CENTER);
  loadfish();
  console.log(fishArray);
}

function draw() {
 // console.log(fishArray);
  tankbackground();
  updateAndDrawFish();
}