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
    
    // Create traits object directly from JSON
    let traits = {
      speed: f.speed,
      finSize: f.finSize,
      size: f.size,
      color: color(f.color[0], f.color[1], f.color[2]),
      aggression: f.aggression,
      lifespan: f.lifespan,
      isSaltwater: f.isSaltwater
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