class Fish {
  constructor(x, y, traits = {}) {
    this.x = x;
    this.y = y;
    this.speed = traits.speed;
    this.finSize = traits.finSize;
    this.size = traits.size;
    this.color = traits.color;
    this.lifespan = traits.lifespan; 
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
    fill(this.color);
    noStroke();
    ellipse(this.x, this.y, this.size, this.size);
  }
}