
/**
 * Purpose of this file: To create the tank background and bubble animation in transparent zone of
 * backdrop.
 * 
 */
let tankBubbles = null;

function tankbackground() {
  if (!tankBubbles) {
    tankBubbles = [];
    for (let i = 0; i < 20; i++) {
      tankBubbles.push({
        x: random(width / 2 - width / 3, width / 2 + width / 3),
        y: random(height / 2, height / 2 + height * 0.35),
        r: random(8, 20),
        speed: random(0.5, 2)
      });
    }
  }

  let t = millis() * 0.0005;
  let blue = color(153 + 30 * sin(t), 212, 205 + 30 * cos(t));
  noStroke();
  fill(blue);
  rectMode(CENTER);
  rect(width / 2, height / 2, width, height);

  noStroke();
  fill(255, 255, 255, 80);
  for (let b of tankBubbles) {
    ellipse(b.x, b.y, b.r);
    b.y -= b.speed;
    if (b.y < height / 2 - height * 0.35) {
      b.y = height / 2 + height * 0.35;
      b.x = random(width / 2 - width / 3, width / 2 + width / 3);
      b.r = random(8, 20);
      b.speed = random(0.5, 2);
    }
  }
  image(img, width / 2, height / 2, width, height);
}