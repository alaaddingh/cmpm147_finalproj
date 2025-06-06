let img;
let cnv;
let initialPlanktonCount = 100;
let planktoncount = initialPlanktonCount; 
let planktonCooldown = 100;
let planktonTimer = 0;
let fishData;
let fishArray = [];
let planktonArray = [];
let tickSlider;
let tickSpeed = 1;
let tickLabel; // For the slider label
let selectedFish = null; //sidepanel stuff
let sidePanel; //sidepanel stuff
let salinitySlider;//slider for salinity
let salinityLevel = 50; // default 50% saltwater
let salinityLabel;

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

  let savedStats1 = "nothing";
  let savedStats2 = "nothing";

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
      health: f.health,
      salinityPreference: f.salinityPreference,
      salinityTolerance: f.salinityTolerance

    };
    traits.diet = (i % 2 === 0) ? "herbivore" : "carnivore";
    
    let x = random(TANK.left() + traits.size / 2, TANK.right() - traits.size / 2);
    let y = random(TANK.top() + traits.size / 2, TANK.bottom() - traits.size / 2);
    fishArray.push(new Fish(x, y, traits));
  }
}

function spawnRandomFishFromJSON() {
  if (!fishData || fishData.length === 0) return;

  const randomIndex = floor(random(fishData.length));
  const f = fishData[randomIndex];

  let traits = {
    speed: f.speed,
    finSize: f.finSize,
    size: f.size,
    color: color(f.color[0], f.color[1], f.color[2]),
    aggression: f.aggression,
    lifespan: f.lifespan,
    health: f.health,
    salinityPreference: f.salinityPreference,
    salinityTolerance: f.salinityTolerance
  };

  traits.diet = random() < 0.5 ? "herbivore" : "carnivore";

  let x = random(TANK.left() + traits.size / 2, TANK.right() - traits.size / 2);
  let y = random(TANK.top() + traits.size / 2, TANK.bottom() - traits.size / 2);
  fishArray.push(new Fish(x, y, traits));
}

function spawnFishFromBreeding() {
  let traits = {
    speed: getRandomTraitNumber(min(savedStats1.speed, savedStats2.speed), max(savedStats1.speed, savedStats2.speed)),
    finSize: getRandomTraitNumber(min(savedStats1.finSize, savedStats2.finSize), max(savedStats1.finSize, savedStats2.finSize)),
    size: getRandomTraitNumber(min(savedStats1.size, savedStats2.size), max(savedStats1.size, savedStats2.size)),
    color: color(getRandomTraitNumber(min(savedStats1.color[0], savedStats2.color[0]), max(savedStats1.color[0], savedStats2.color[0])), getRandomTraitNumber(min(savedStats1.color[1], savedStats2.color[1]), max(savedStats1.color[1], savedStats2.color[1])), getRandomTraitNumber(min(savedStats1.color[2], savedStats2.color[2]), max(savedStats1.color[2], savedStats2.color[2]))),
    aggression: getRandomTraitNumber(min(savedStats1.aggression, savedStats2.aggression), max(savedStats1.aggression, savedStats2.aggression)),
    lifespan: getRandomTraitNumber(min(savedStats1.lifespan, savedStats2.lifespan), max(savedStats1.lifespan, savedStats2.lifespan)),
    health: f.health,
    salinityPreference: getRandomTraitNumber(min(savedStats1.salinityPreference, savedStats2.salinityPreference), max(savedStats1.salinityPreference, savedStats2.salinityPreference)),
    salinityTolerance: getRandomTraitNumber(min(savedStats1.salinityTolerance, savedStats2.salinityTolerance), max(savedStats1.salinityTolerance, savedStats2.salinityTolerance)),
  };

  console.log("Breeding new fish with");
  console.log(traits);
  let x = random(TANK.left() + traits.size / 2, TANK.right() - traits.size / 2);
  let y = random(TANK.top() + traits.size / 2, TANK.bottom() - traits.size / 2);
  fishArray.push(new Fish(x, y, traits));
}

function getRandomTraitNumber(min, max){
  return Math.random() * (max - min) + min;
}


/**
 * Always maintain  planktoncount of plankton in the tank
 */
function maintainPlanktonCount() {
    while (planktonArray.length < planktoncount) {
        let size = random(3, 6);
        let speed = random(0.5, 1.5); 
        let x = random(TANK.left() + size / 2, TANK.right() - size / 2);
        let y = random(TANK.top() + size / 2, TANK.bottom() - size / 2);
        planktonArray.push(new Plankton(x, y, { size: size, speed: speed }));
    }
}

function generatePlaknton() {
  let size = random(3, 6);
        let speed = random(0.5, 1.5); 
        let x = random(TANK.left() + size / 2, TANK.right() - size / 2);
        let y = random(TANK.top() + size / 2, TANK.bottom() - size / 2);
        planktonArray.push(new Plankton(x, y, { size: size, speed: speed }));
}

function generateInitialPlankton(count) {
  while (planktonArray.length < count) {
    let size = random(3, 6);
    let speed = random(0.5, 1.5); 
    let x = random(TANK.left() + size / 2, TANK.right() - size / 2);
    let y = random(TANK.top() + size / 2, TANK.bottom() - size / 2);
    planktonArray.push(new Plankton(x, y, { size: size, speed: speed }));
}
}
function preload() {
  img = loadImage('./assets/melvins_fishtank.png'); 
  fishData = loadJSON('./assets/fish.json');
  preloadFeeder();
  console.log(fishData);
}

/**
 * screen display of fish count
 */
function displayfishcount() {
  fill(255);
  textSize(16);
  textAlign(LEFT, TOP);
  text('Fish Count: ' + fishArray.length, 10, 10);
}

function setup() {
  background(100);
  let cnvScale = 0.8;
  let cWidth = windowWidth * cnvScale;
  let cHeight = windowHeight * cnvScale;

  let xPos = (windowWidth - cWidth) / 2;
  let yPos = 80; 



  cnv = createCanvas(cWidth, cHeight);
  cnv.position(xPos, yPos);
  imageMode(CENTER);
  loadfish();
  generateRandomFish(10);
  console.log(fishArray);
  generateInitialPlankton(initialPlanktonCount);
  setupFeeder();

  // Place the slider at a fixed position (e.g., top left)
  tickSlider = createSlider(0.1, 3, 1, 0.01);
  tickSlider.position(15, 200);
  tickSlider.style('width', '200px');

  // Create the label and position it next to the slider
  tickLabel = createDiv('Speed: ' + tickSpeed.toFixed(2) + 'x');
  tickLabel.position(200, 100); 
  tickLabel.style('color', '#000');
  tickLabel.style('font-size', '16px');
  tickLabel.style('font-family', 'sans-serif');
  tickLabel.style('user-select', 'none');
  tickLabel.style('text-shadow', '1px 1px 2px #000');

  salinitySlider = createSlider(0, 100, 50, 1);
  salinitySlider.position(15, tickSlider.y + 60);
  salinitySlider.style('width', '200px');

  salinityLabel = createDiv('Salinity: ' + salinityLevel + '%');
  salinityLabel.position(salinitySlider.x, salinitySlider.y + salinitySlider.height + 5);
  salinityLabel.style('color', '#000');
  salinityLabel.style('font-size', '16px');
  salinityLabel.style('font-family', 'sans-serif');
  salinityLabel.style('user-select', 'none');
  salinityLabel.style('text-shadow', '1px 1px 2px #000');

  //side panekl setup
  let panelWidth = 200; // or any width you want!
  sidePanel = new SidePanel(width -panelWidth/2, 0, panelWidth, height);


  //spawn button to spawn random fish from JSON
  let spawnButton = createButton('Spawn Random Fish');
  spawnButton.position(salinitySlider.x, salinityLabel.y + 40);
  spawnButton.mousePressed(spawnRandomFishFromJSON);
  spawnButton.style('font-size', '14px');
  spawnButton.style('padding', '6px 12px');
  spawnButton.style('background-color', '#55aaff');
  spawnButton.style('color', 'white');
  spawnButton.style('border', 'none');
  spawnButton.style('border-radius', '5px');
  spawnButton.style('cursor', 'pointer');
}

function draw() {
  tickSpeed = tickSlider.value();
  salinityLevel = salinitySlider.value();
  tankbackground();

  updateAndDrawFish();
  updateAndDrawPlankton();
  showFishStats();
  if (millis() - planktonTimer >= planktonCooldown/tickSpeed) {
    planktonTimer = millis();
    generatePlaknton();
  }
  
  
  // maintainPlanktonCount();
  displayfishcount();

  // Update the label text and keep it below the slider
  tickLabel.html('Speed: ' + tickSpeed.toFixed(2) + 'x');
  tickLabel.position(tickSlider.x, tickSlider.y + tickSlider.height + 20);

  salinityLabel.html('Salinity: ' + salinityLevel + '%');
  salinityLabel.position(salinitySlider.x, salinitySlider.y + salinitySlider.height + 5);

    drawFeeder();
    updateAndDrawFood();

    
  sidePanel.display(selectedFish);


}

function showFishStats() {//rounded the stats so it doesn't look too cluttered
  for (let fish of fishArray) {
    if (fish.isMouseOver()) {
      let stats = 
       `Speed: ${fish.speed.toFixed(2)}
Fin Size: ${fish.finSize.toFixed(2)}
Size: ${fish.size.toFixed(2)}
Aggression: ${fish.aggression.toFixed(2)}
Lifespan: ${fish.lifespan.toFixed(2)}
Energy: ${fish.energy.toFixed(1)}
Health: ${fish.health.toFixed(2)}
Diet: ${fish.diet}
Salinity Pref: ${fish.salinityPreference.toFixed(2)}%
Tolerance: ±${fish.salinityTolerance.toFixed(2)}%`
      fill(255, 230);
      stroke(0);
      strokeWeight(2);
      textAlign(LEFT, TOP);
      textSize(14);
      text(stats, fish.x + fish.size / 2 + 10, fish.y - fish.size / 2);
      fill(255, 255);

      
    }

  }
}

/**
 * Generates COUNT number of random fish with varied traits
 */
function generateRandomFish(count) {
  for (let i = 0; i < count; i++) {
    let traits = {
      speed: random(0.5, 3),        // Slower to faster swimmers
      finSize: Math.floor(random(5, 25)),       // Small to large fins
      size: Math.floor(random(15, 50)),         // Small to medium fish
      color: color(
        random(50, 255),
        random(50, 255),
        random(50, 255)
      ),
      aggression: random(0, 1),     // 0-1 scale
      lifespan: Math.floor(random(80, 250)), // Frames of lifespan
      salinityPreference: random() > 0.5 ? 80 : 10,
      salinityTolerance: random(10, 30)
    };

    // Make sure it fits in the tank
    let x = random(
      TANK.left() + traits.size/2, 
      TANK.right() - traits.size/2
    );
    let y = random(
      TANK.top() + traits.size/2, 
      TANK.bottom() - traits.size/2
    );

    fishArray.push(new Fish(x, y, traits));
  }
}

function breedFish(){
  spawnFishFromBreeding();
  savedStats1 = "nothing";
  savedStats2 = "nothing";
}

function saveFishStats() {
  if(savedStats1 == "nothing"){
    for (let fish of fishArray) {
      if (fish.isMouseOver()) {
        savedStats1 = {
          speed: fish.speed,
          finSize: fish.finSize,
          size: fish.size,
          color: fish.color,
          aggression: fish.aggression,
          lifespan: fish.lifespan,
          energy: fish.energy,
          salinityPreference: fish.salinityPreference,
          salinityTolerance: fish.salinityTolerance
        }
          break;
              }
      savedStats1 = "nothing";
    }
  }
  else {
    for (let fish of fishArray){
      if(fish.isMouseOver()){
        savedStats2 = {
          speed: fish.speed,
          finSize: fish.finSize,
          size: fish.size,
          color: fish.color,
          aggression: fish.aggression,
          lifespan: fish.lifespan,
          energy: fish.energy,
          salinityPreference: fish.salinityPreference,
          salinityTolerance: fish.salinityTolerance
      }
        breedFish();
        break;
      }
      savedStats2 = "nothing";
    }
  }

}


function mousePressed() {
  console.log("Mouse pressed at: ", mouseX, mouseY);
  //fish sellection handler for side panel
  selectedFish = null;
  for (let fish of fishArray) {
    if (dist(mouseX, mouseY, fish.x, fish.y) < fish.size / 2) {
      selectedFish = fish;
      break;
    }
  }
  saveFishStats();
  //ends here

  mousePressedFeeder();
}

function mouseDragged() {
  mouseDraggedFeeder();
}

function mouseReleased() {
  mouseReleasedFeeder();
}
//SID E PANEL STUFF
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  sidePanel = new SidePanel(width - panelWidth, 0, panelWidth, height);
}
