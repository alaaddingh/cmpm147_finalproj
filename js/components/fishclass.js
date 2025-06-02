class Fish {
  constructor(x, y, traits = {}) {
    this.x = x;
    this.y = y;
    this.baseY = y; // used for tickspeed
    this.maxEnergy = traits.lifespan; // How long without eating before death
    this.speed = traits.speed;
    this.finSize = traits.finSize;
    this.size = traits.size;
    this.color = traits.color;
    this.aggression = traits.aggression;
    this.lifespan = traits.lifespan;  
    this.age = 0;
    this.energy = 50; // Used for breeding and lifespan
    this.alive = true;
    this.isSaltwater = traits.isSaltwater;
    this.swimTime = random(TWO_PI);
    // motion properties
    this.setInitialMotion();
    this.swimOffset = random(TWO_PI);
    this.swimAmplitude = random(4, 8);
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
   * determines if mouse is over the fish
   */ 

  isMouseOver() {
    return dist(mouseX, mouseY, this.x, this.y) < this.size / 2;
  }
  /**
   * Checks if fish is alive
   * We can possibly remove age and use energy instead
   * use lifespan as max energy
   * when energy=0, fish dies
   * maybe energy < 30%, fish moves slower?
   */
  isAlive() {
    if (this.energy <= 0) {
      this.alive = false;
    } else {
      this.age += tickSpeed;
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
      this.baseY = constrain(this.baseY, TANK.top() + this.size / 2, TANK.bottom() - this.size / 2);
    }
    if (bounced) this.swimOffset = random(TWO_PI);
  }

  /**
   *  updates motion per frame
   */
  move() {
    this.x += this.vx * tickSpeed;
    this.baseY += this.vy * tickSpeed;
    this.swimTime += this.swimFrequency * tickSpeed;
    this.y = this.baseY + sin(this.swimTime + this.swimOffset) * this.swimAmplitude;

   
  }
  /**
   *  Checks if this fish collides with another fish
   */

  checkCollision(fishArray) {
    for (let other of fishArray) {
      if (other !== this) {
        let dx = this.x - other.x;
        let dy = this.y - other.y;
        let distance = sqrt(dx * dx + dy * dy);
        let minDistance = (this.size + other.size) / 2;
        
        if (distance < minDistance) {
          // Collision detected
          return other;
        }
      }
    }
    return null;
  }

  /**
   *  Checks if this fish can eat the other fish
   */
  eatFish(other) {
    // Can't eat fish of same or larger size unless much more aggressive
    const sizeRatio = this.size / other.size;
    const aggressionFactor = this.aggression / other.aggression;
    
    if (sizeRatio > 1.5 || (sizeRatio > 1.2 && aggressionFactor > 1.5)) {
      // Successfully eat the other fish
      this.energy += other.size * 5; // Gain energy based on prey size
      other.alive = false; // Set as dead, updateFish.js will handle removal
    //  console.log(this+" ate "+other);
      return true;
    }
    return false;
  }

    /**
     *  Checks if this fish can breed with the other fish
     */
    breed(other) {
      // Check breeding compatibility
      if (this.isSaltwater !== other.isSaltwater || 
          this.energy < 25 || other.energy < 25 ||
          this.age > this.lifespan * 0.8 || other.age > other.lifespan * 0.8 || 
          this.age < 1000 || other.age < 1000) {
        return null;
      }
      
      // Genetic recombination with mutation
      let newTraits = {
        speed: (this.speed + other.speed) / 2 * random(0.9, 1.1),
        size: (this.size + other.size) / 2 * random(0.9, 1.1),
        finSize: (this.finSize + other.finSize) / 2 * random(0.9, 1.1),
        color: lerpColor(color(this.color), color(other.color), random(0.3, 0.7)),
        aggression: (this.aggression + other.aggression) / 2 * random(0.9, 1.1),
        lifespan: (this.lifespan + other.lifespan) / 2 * random(0.9, 1.1),
        isSaltwater: this.isSaltwater
      };
      
     // console.log(self+" bred with "+other);
      // Position offspring between parents
      return new Fish(
        (this.x + other.x) / 2,
        (this.y + other.y) / 2,
        newTraits
      );
    }

  update(fishArray) {
    if (!this.isAlive()) {
      fishArray.splice(fishArray.indexOf(this), 1);
      return;
    }

    this.energy -= 0.1 * tickSpeed;
    // Collision Check
    let other = this.checkCollision(fishArray);
    if (other) {
      // Attempt to breed first
      let offspring = this.breed(other);
      if (offspring) {
        fishArray.push(offspring);
      // Attempt to eat if breeding didnt work
      } else if (this.eatFish(other)) {
        fishArray.splice(fishArray.indexOf(other), 1);
      }
    }
    this.move();
    this.checkBounds();

    // Random chance of death
    if (random() < 0.00015) this.alive = false;
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