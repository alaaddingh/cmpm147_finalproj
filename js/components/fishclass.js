class Fish {
  constructor(x, y, traits = {}) {
    this.x = x;
    this.y = y;
    this.speed = traits.speed;
    this.finSize = traits.finSize;
    this.size = traits.size;
    this.color = traits.color;
    this.lifespan = traits.lifespan; 
    this.aggression = traits.aggression;
    this.age = 0;
    this.alive = true;

    // motion properties
    this.setInitialMotion();
    this.swimOffset = random(TWO_PI);
    this.swimAmplitude = random(1, 4);
    this.swimFrequency = random(0.05, 0.1);
  }


  /**
   * Sets the initial motion of the fish in a random direction, 
   * biases left or right for more natural swimming behavior.
   */
  setInitialMotion() {
    let angle = random(-PI / 4, PI / 4);
    if (random() < 0.5) angle += PI;
    this.vx = cos(angle) * this.speed;
    this.vy = sin(angle) * this.speed * 0.3;
  }

  /**
   * Checks if fish is alive
   */
  isAlive() {
    if (this.age >= this.lifespan) {
      this.alive = false;
    } else {
      this.age++;
    }
    return this.alive;
  }

  /**
   * Checks if fish is within the tank. 
   * If not, change velocity to keep it within bounds.
   */
  checkBounds() {
    let bounced = false;
    if (this.x - this.size / 2 < TANK.left() || this.x + this.size / 2 > TANK.right()) {
      this.vx *= -1;
      bounced = true;
      this.x = constrain(this.x, TANK.left() + this.size / 2, TANK.right() - this.size / 2);
    }
    if (this.y - this.size / 2 < TANK.top() || this.y + this.size / 2 > TANK.bottom()) {
      this.vy *= -1;
      bounced = true;
      this.y = constrain(this.y, TANK.top() + this.size / 2, TANK.bottom() - this.size / 2);
    }
    if (bounced) this.swimOffset = random(TWO_PI);
  }

  /**
   *  updates motion per frame
   */
  move() {
    this.x += this.vx;
    this.y += this.vy;
    this.y += sin(frameCount * this.swimFrequency + this.swimOffset) * this.swimAmplitude;
  }

  update() {
    if (!this.isAlive()) {
      this.x = -100;
      return;
    }
    this.move();
    this.checkBounds();
  }

 
  display() {
  push();
  translate(this.x, this.y);
  let angle = atan2(this.vy, this.vx);
  rotate(angle);
  if (this.vx < 0) {
    scale(1, -1);
  }

  // BODY (main ellipse)
  fill(this.color);
  noStroke();
  ellipse(0, 0, this.size, this.size * 0.6);

  // HEAD (smaller ellipse)
  fill(lerpColor(this.color, color(255), 0.2));
  ellipse(this.size * 0.25, 0, this.size * 0.5, this.size * 0.5 * 0.6);

  // TAIL (angled triangle)
  fill(lerpColor(this.color, color(255), 0.5));
  let tailW = this.finSize;
  let tailH = this.size * 0.5;
  triangle(
    -this.size / 2, 0,
    -this.size / 2 - tailW, -tailH / 3,
    -this.size / 2 - tailW, tailH / 3
  );

  // TOP FIN (curved)
  fill(lerpColor(this.color, color(255,255,255), 0.3));
  beginShape();
  vertex(-this.size * 0.1, -this.size * 0.3);
  bezierVertex(
    0, -this.size * 0.7,
    this.finSize * 0.5, -this.size * 0.7,
    this.size * 0.2, -this.size * 0.3
  );
  endShape(CLOSE);

  // BOTTOM FIN
  fill(lerpColor(this.color, color(0,0,0), 0.2));
  ellipse(0, this.size * 0.25, this.finSize * 0.7, this.finSize * 0.3);

  // EYE
  fill(255);
  ellipse(this.size * 0.18, -this.size * 0.1, this.size * 0.13, this.size * 0.13);
  fill(0);
  ellipse(this.size * 0.18, -this.size * 0.1, this.size * 0.07, this.size * 0.07);
  fill(255,255,255,180);
  ellipse(this.size * 0.20, -this.size * 0.12, this.size * 0.025, this.size * 0.025);
  
  // FURROWED EYEBROW for aggressive fish
  if (this.aggression > 0.5) {
    stroke(60, 30, 30);
    strokeWeight(3);
    line(
      this.size * 0.13, -this.size * 0.18,
      this.size * 0.23, -this.size * 0.14
    );
    noStroke();
  }
  // MOUTH
  stroke(80, 40, 40);
  strokeWeight(2);
  noFill();
  arc(this.size * 0.28, this.size * 0.05, this.size * 0.08, this.size * 0.05, 0, PI);

  pop();
}
}