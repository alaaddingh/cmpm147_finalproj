// feeder.js
let feederImg;
let feederX, feederY;
let feederW = 340, feederH = 300;
let draggingFeeder = false;
let offsetX, offsetY;

let tipping = false;
let tipStartTime = 0;
let tipDuration = 700;
let tipAngle = 0;

let foodParticles = [];
let particleCount = 20;

function preloadFeeder() {
  feederImg = loadImage('./assets/foodimg.png');
}

function setupFeeder() {
  feederX = 10;
  feederY = height - feederH - 10;
}

function drawFeeder() {
  push();
  imageMode(CORNER);

  translate(feederX + feederW / 2, feederY + feederH / 2);

  // Animate tip
  if (tipping) {
    let elapsed = millis() - tipStartTime + 100;
    let progress = constrain(elapsed / tipDuration, 0, 1);
    tipAngle = sin(progress * PI) * radians(-60); 
    rotate(-tipAngle);

    if (progress >= 1) tipping = false;
  }

  // Draw image or fallback
  if (feederImg) {
    image(feederImg, -feederW / 2, -feederH / 2, feederW, feederH);
  } else {
    fill(100, 180, 220);
    rect(-feederW / 2, -feederH / 2, feederW, feederH, 20);
    fill(0);
    textAlign(CENTER, CENTER);
    textSize(16);
    text('Feeder', 0, 0);
  }

  pop();
}

function mousePressedFeeder() {
  if (
    mouseX > feederX && mouseX < feederX + feederW &&
    mouseY > feederY && mouseY < feederY + feederH
  ) {
    draggingFeeder = true;
    offsetX = mouseX - feederX;
    offsetY = mouseY - feederY;
  }
}

function mouseDraggedFeeder() {
  if (draggingFeeder) {
    feederX = constrain(mouseX - offsetX, 0, width - feederW);
    feederY = constrain(mouseY - offsetY, 0, height - feederH);
  }
}

function mouseReleasedFeeder() {
  if (draggingFeeder) {
    if (
      mouseX > TANK.left() && mouseX < TANK.right() &&
      mouseY > TANK.top() && mouseY < TANK.bottom()
    ) {
      startTipping();
      dispenseFood(mouseX, mouseY);
    }
    draggingFeeder = false;
  }
}

function startTipping() {
  tipping = true;
  tipStartTime = millis();
}

function dispenseFood(x, y) {
  for (let i = 0; i < particleCount; i++) {
    let px = x + 100;
    let py = y - 30;

    let size = random(3, 6);
    let speed = random(0.5, 1.2); 

    let plankton = new Plankton(px, py, {
      size: size,
      speed: speed
    });

    plankton.vy = random(0.5, 1.5); 
    plankton.dropping = true;
    plankton.alpha = 0;

    planktonArray.push(plankton);
  }
}



function updateAndDrawFood() {
  for (let i = foodParticles.length - 1; i >= 0; i--) {
    let f = foodParticles[i];

    f.x += f.vx;
    f.y += f.vy;
    f.vy += 0.1;
    f.alpha -= 2;

    fill(255, 220, 100, f.alpha);
    noStroke();
    ellipse(f.x, f.y, f.size);

    if (f.alpha <= 0 || f.y > TANK.bottom()) {
      foodParticles.splice(i, 1);
    }
  }
}
