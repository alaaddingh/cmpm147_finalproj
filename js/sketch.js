let img;
let cnv;
let initialPlanktonCount = 100;
let planktoncount = initialPlanktonCount; 
let planktonCooldown = 100;
let planktonTimer = 0;
let fishData;
let fishArray = [];
let planktonArray = [];
let fishnames = [];
let fishNamesData;
let tickSlider;
let tickSpeed = 1;
let tickLabel; // For the slider label
let selectedFish = null; //sidepanel stuff
let sidePanel; //sidepanel stuff
let salinitySlider;//slider for salinity
let salinityLevel = 50; // default 50% saltwater
let salinityLabel;
let cloneFishBtn = null;


// async call to load json data for fish names
function loadJSONAsync(path) {
  return new Promise((resolve, reject) => {
    loadJSON(path, resolve, reject);
  });
}


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
      salinityTolerance: f.salinityTolerance,
      name: random(fishnames),

    };
    traits.diet = (i % 2 === 0) ? "herbivore" : "carnivore";
    
    let x = random(TANK.left() + traits.size / 2, TANK.right() - traits.size / 2);
    let y = random(TANK.top() + traits.size / 2, TANK.bottom() - traits.size / 2);
    fishArray.push(new Fish(x, y, traits));
  }
}

function spawnRandomFishFromJSON() {
  if (!fishData || fishData.length === 0) return;

  const rand = seededRandom;
  const randomIndex = floor(rand() * fishData.length);
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
    salinityTolerance: f.salinityTolerance,
    name: fishnames[floor(rand() * fishnames.length)],
  };

  traits.diet = rand() < 0.5 ? "herbivore" : "carnivore";

  let x = lerp(TANK.left() + traits.size/2, TANK.right() - traits.size/2, rand());
  let y = lerp(TANK.top() + traits.size/2, TANK.bottom() - traits.size/2, rand());
  
  let fish = new Fish(x, y, traits, rand);
  fishArray.push(fish);
}

let seed = "fishtank";
let seededRandom;

function seededRandomGenerator(s) {
  // Simple hash function to convert string to number
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    hash = (hash << 5) - hash + s.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  
  // Simple seeded random generator (Mulberry32 algorithm)
  return function() {
    hash |= 0;
    hash = hash + 0x6D2B79F5 | 0;
    let t = Math.imul(hash ^ hash >>> 15, 1 | hash);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function spawnFishFromBreeding() {
  let traits = {
    speed: getRandomTraitNumber(min(savedStats1.speed, savedStats2.speed), max(savedStats1.speed, savedStats2.speed)),
    finSize: getRandomTraitNumber(min(savedStats1.finSize, savedStats2.finSize), max(savedStats1.finSize, savedStats2.finSize)),
    size: getRandomTraitNumber(min(savedStats1.size, savedStats2.size), max(savedStats1.size, savedStats2.size)),
    color: color(getRandomTraitNumber(min(savedStats1.color[0], savedStats2.color[0]), max(savedStats1.color[0], savedStats2.color[0])), getRandomTraitNumber(min(savedStats1.color[1], savedStats2.color[1]), max(savedStats1.color[1], savedStats2.color[1])), getRandomTraitNumber(min(savedStats1.color[2], savedStats2.color[2]), max(savedStats1.color[2], savedStats2.color[2]))),
    aggression: getRandomTraitNumber(min(savedStats1.aggression, savedStats2.aggression), max(savedStats1.aggression, savedStats2.aggression)),
    lifespan: getRandomTraitNumber(min(savedStats1.lifespan, savedStats2.lifespan), max(savedStats1.lifespan, savedStats2.lifespan)),
    health: getRandomTraitNumber(min(savedStats1.health, savedStats2.health), max(savedStats1.health, savedStats2.health)),
    salinityPreference: getRandomTraitNumber(min(savedStats1.salinityPreference, savedStats2.salinityPreference), max(savedStats1.salinityPreference, savedStats2.salinityPreference)),
    salinityTolerance: (savedStats1.salinityTolerance + savedStats2.salinityTolerance) / 2,

    name: random(fishnames),
    diet: (savedStats1.diet === savedStats2.diet) ? savedStats1.diet : (random() < 0.5 ? savedStats1.diet : savedStats2.diet)
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

function generateInitialPlankton(count, useSeededRandom = false) {
  const rand = useSeededRandom ? seededRandom : Math.random;
  
  while (planktonArray.length < count) {
    let size = lerp(3, 6, rand());
    let speed = lerp(0.5, 1.5, rand()); 
    let x = lerp(TANK.left() + size / 2, TANK.right() - size / 2, rand());
    let y = lerp(TANK.top() + size / 2, TANK.bottom() - size / 2, rand());
    planktonArray.push(new Plankton(x, y, { size: size, speed: speed }));
  }
}

function preload() {
  img = loadImage('./assets/melvins_fishtank.png'); 
  fishData = loadJSON('./assets/fish.json');
    const nameFile = loadJSON("./assets/fishnames.json");
    fishnames = nameFile.names;
  
 
  preloadFeeder();
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

async function setupnames() {
  fishNamesData = await loadJSONAsync('./assets/fishnames.json');
  fishnames = fishNamesData.names;
  console.log("Fish names loaded:", fishnames);

}

async function setup() {
  background(100);

  // ---------- canvas ----------
  const cnvScale = 0.8;
  const cWidth   = windowWidth  * cnvScale;
  const cHeight  = windowHeight * cnvScale;
  const xPos     = (windowWidth  - cWidth)  / 2 - 20; // shift right to make room for UI
  const yPos     = 80;

  seededRandom = seededRandomGenerator(seed);

  cnv = createCanvas(cWidth, cHeight);
  cnv.position(xPos, yPos);
  imageMode(CENTER);

  fishNamesData = await loadJSONAsync('./assets/fishnames.json');
  fishnames     = fishNamesData.names;
  loadfish();
  setupnames();
  generateRandomFish(10, true);
  generateInitialPlankton(initialPlanktonCount);
  setupFeeder();



let container = createDiv(); // Outer container
container.class('side-panel-container');
container.parent(document.body); // important

let wrapper = createDiv();
wrapper.addClass('panel-wrapper');
wrapper.parent(container);

let toggle = createButton('');
toggle.addClass('panel-toggle');
wrapper.addClass('collapsed');
toggle.parent(container); // sibling of wrapper

toggle.mousePressed(() => {
  wrapper.toggleClass('collapsed');
  wrapper.toggleClass('expanded');
  const isCollapsed = wrapper.hasClass('collapsed');
  toggle.html(isCollapsed ? ' ' : '☰');
});


// Create control panel inside wrapper
const controlPanel = createDiv();
controlPanel.class('control-panel');
controlPanel.parent(wrapper);



  // Seed label + input + regen button
  const seedLabel = createDiv('Seed');
  seedLabel.parent(controlPanel);
  seedLabel.class('seed-label');


  const seedInput = createInput(seed);
  seedInput.parent(controlPanel);
  seedInput.input(() => seed = seedInput.value());

  const regenButton = createButton('Regenerate with Seed');
  regenButton.parent(controlPanel);
  regenButton.class('seed-regen-button');
  regenButton.mousePressed(() => {
    fishArray      = [];
    planktonArray  = [];
    seededRandom   = seededRandomGenerator(seed);
    generateRandomFish(10, true);
    generateInitialPlankton(initialPlanktonCount, true);
  });

  // Speed slider + label
  tickLabel  = createDiv('Speed: ' + tickSpeed.toFixed(2) + 'x');
  tickLabel.parent(controlPanel);
  tickLabel.class('tick-label');

  tickSlider = createSlider(0.1, 3, 1, 0.01);
  tickSlider.parent(controlPanel);

  // Salinity slider + label
  salinityLabel = createDiv('Salinity: ' + salinityLevel + '%');
  salinityLabel.parent(controlPanel);
  salinityLabel.class('salinity-label');

  salinitySlider = createSlider(0, 100, 50, 1);
  salinitySlider.parent(controlPanel);

  // Spawn button
const spawnButtonDiv = createDiv(); 
spawnButtonDiv.parent(controlPanel);
const spawnButton = createButton('Spawn Random Fish');
spawnButton.class('spawn-button'); 
spawnButton.parent(spawnButtonDiv);
spawnButton.mousePressed(spawnRandomFishFromJSON);



  

  // ---------- RIGHT-HAND FISH STATS PANEL ----------
  let panelWidth = 250;
  sidePanel = new SidePanel(width - panelWidth + 100, 10, panelWidth + 50, height - 300);

  // ---------- Almanac ----------
  almanac = new Almanac();
  almanac.setup();
}
//nclonign button on side pame;
function cloneSelectedFish(fish) {
  let cloneTraits = {
    name: fish.name + " (Clone)",
    speed: fish.speed,
    finSize: fish.finSize,
    size: fish.size,
    color: fish.color,
    aggression: fish.aggression,
    lifespan: fish.lifespan,
    health: fish.health,
    salinityPreference: fish.salinityPreference,
    salinityTolerance: fish.salinityTolerance,
    diet: fish.diet
  };
  let x = fish.x + 30;
  let y = fish.y + 30;
  fishArray.push(new Fish(x, y, cloneTraits));
}

function draw() {
  // Pause the game if the almanac is visible
  if (almanac.visible) {
    almanac.display();
    return;
  }
  tickSpeed = tickSlider.value();
  salinityLevel = salinitySlider.value();
  tankbackground();

  updateAndDrawFish();
  updateAndDrawPlankton();
  showFishName();
  if (millis() - planktonTimer >= planktonCooldown/tickSpeed) {
    planktonTimer = millis();
    generatePlaknton();
  }
  
  
  // maintainPlanktonCount();
  displayfishcount();

  // Update the label text and keep it below the slider
  tickLabel.html('Speed: ' + tickSpeed.toFixed(2) + 'x');
  salinityLabel.html('Salinity: ' + salinityLevel + '%');


    drawFeeder();
    updateAndDrawFood();

    
  sidePanel.display(selectedFish);
  almanac.display();
  almanac.update();

  // Show/hide Clone Fish button:
  if (selectedFish && !cloneFishBtn) {
    cloneFishBtn = createButton('Clone Fish');
    cloneFishBtn.mousePressed(() => {
      cloneSelectedFish(selectedFish);
    });
    cloneFishBtn.elt.addEventListener('mousedown', (e) => {
      e.stopPropagation();
    });
    cloneFishBtn.position(width - 190, 90); // Adjust X/Y as needed!
    cloneFishBtn.size(120, 34);
    cloneFishBtn.style('font-size', '15px');
    cloneFishBtn.style('background', '#50ba77');
    cloneFishBtn.style('color', '#fff');
    cloneFishBtn.style('border', 'none');
    cloneFishBtn.style('border-radius', '8px');
    cloneFishBtn.style('cursor', 'pointer');
    cloneFishBtn.mousePressed(() => {
      cloneSelectedFish(selectedFish);
    });
  } else if (!selectedFish && cloneFishBtn) {
    cloneFishBtn.remove();
    cloneFishBtn = null;
  }
}

function showFishName() {//rounded the stats so it doesn't look too cluttered
  for (let fish of fishArray) {
    if (fish.isMouseOver()) {
      let stats = 
       `Name: ${fish.name}\n`
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
function generateRandomFish(count, useSeededRandom = false) {
  for (let i = 0; i < count; i++) {
    const rand = useSeededRandom ? seededRandom : Math.random;
    
    let traits = {
      speed: lerp(0.5, 3, rand()), 
      finSize: lerp(5, 25, rand()),
      size: lerp(15, 50, rand()),
      color: color(
        lerp(50, 255, rand()),
        lerp(50, 255, rand()),
        lerp(50, 255, rand())
      ),
      aggression: rand(),
      lifespan: lerp(80, 250, rand()),
      salinityPreference: rand() > 0.5 ? 80 : 10,
      salinityTolerance: lerp(10, 30, rand()),
      name: fishnames[floor(rand() * fishnames.length)],
    };

    // Position using seeded random
    let x = lerp(
      TANK.left() + traits.size/2, 
      TANK.right() - traits.size/2,
      rand()
    );
    let y = lerp(
      TANK.top() + traits.size/2, 
      TANK.bottom() - traits.size/2,
      rand()
    );

    let fish = new Fish(x, y, traits);
    fish.setInitialMotion(rand); // Set initial motion with seeded random
    fishArray.push(fish);
  }
}

// Helper function for linear interpolation
function lerp(min, max, t) {
  return min + (max - min) * t;
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
          salinityTolerance: fish.salinityTolerance,
          name : fish.name
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
          salinityTolerance: fish.salinityTolerance,
          name: fish.name
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
      return;
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
