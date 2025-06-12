//fishclas.js
class Fish {
  constructor(x, y, traits = {}, rand = Math.random) {
    this.x = x;
    this.y = y;
    this.name = traits.name || "Unnamed"; // Default name if not provided
    this.baseY = y; // used for tickspeed
    this.maxEnergy = traits.lifespan; // How long without eating before death
    this.invincibleTimer = 5; // seconds of invincibility after spawning
    this.traitSpeed    = traits.speed;    // baseline speed used for inheritance
    this.speed         = this.traitSpeed; // current, will be reset/boosted at runtime
    this.originalSpeed = this.traitSpeed; 
    this.finSize = traits.finSize;
    this.size = traits.size;
    this.color = traits.color;
    this.aggression = traits.aggression;
    this.lifespan = traits.lifespan;  
    this.age = 0;
    this.energy = 100; // Used for breeding and lifespan
    this.health = traits.health || 100; // Default to 100 if not defined
    this.maxHealth = 100;
    this.alive = true;
    //this.isSaltwater = traits.isSaltwater;
    this.salinityPreference = traits.salinityPreference || 50;
    this.salinityTolerance = traits.salinityTolerance || 20;//a fallback value if not provided
    this.diet = traits.diet || "herbivore";

    this.lastBreedTime = -Infinity; // timestamp of last breeding

    this.lastEatTime = -Infinity; // timestamp of last eating
    this.eatCooldown = 100;

    // this.attackCooldown = 0; might add this for carnivores since they are eating their children which makes it so they can't reproduce
    this.swimTime = random(TWO_PI);
    // motion properties
    this.swimOffset = rand() * TWO_PI;
    this.swimAmplitude = 4 + 4 * rand();
    this.swimFrequency = 0.05 + 0.05 * rand();
    
    this.setInitialMotion(rand);

  // Variables for state machine
  // and fish behavior

  this.heading = random(0, TWO_PI);
  this.heading = random(0, TWO_PI);
  this.decisionCooldown = 700; 
  this.lastDecisionTime = millis(); 
  this.state        = "wander";          // wander, hunt, flee
  this.stateTimer   = 10;                
  this.target       = null;              // current fish or plankton we’re focussed on
  this.visionRange  = 100;
               
  this.visionAngle  = PI * 0.65; // 65 degrees field of view
  this.maxStateDur  = { hunt: 4500, flee: 1000 };

  
  
  }


  /**
   * Sets the initial motion of the fish in a random direction, 
   * biases left or right for more natural swimming behavior.
   */
  setInitialMotion(rand = Math.random) {
    let angle = -PI/4 + (PI/2) * rand();
    if (rand() < 0.5) angle += PI;
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
    if (this.energy <= 0 || this.health <= 0 ) {
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
  * 
  *  Gets the environment around the fish.
  *  Returns an object with closest plankton, herbivore, and carnivore.
  */

  getEnvironment(planktonArray, fishArray) {
  const fwd      = createVector(this.vx, this.vy).normalize();   
  const inCone   = (x, y) => {
    const toObj   = createVector(x - this.x, y - this.y);
    const dist    = toObj.mag();
    if (dist > this.visionRange || dist === 0) return false;
    const angle   = acos(p5.Vector.dot(fwd, toObj.copy().normalize()));
    // return angle < this.visionAngle * 0.6;   // half-angle on either side
    return angle < this.visionAngle; 
  };

  let closestPlankton   = null, dPlankton   = Infinity;
  let closestHerbivore  = null, dHerbivore  = Infinity;
  let closestCarnivore  = null, dCarnivore  = Infinity;

  for (const p of planktonArray) {
    const d = dist(this.x, this.y, p.x, p.y);
    if (d < dPlankton && inCone(p.x, p.y)) { closestPlankton = p; dPlankton = d; }
  }

  for (const o of fishArray) {
    if (o === this || !o.alive) continue;
    const d = dist(this.x, this.y, o.x, o.y);
    if (!inCone(o.x, o.y)) continue;

    if (o.diet === "herbivore" && d < dHerbivore && o.size < this.size) {
      closestHerbivore = o; dHerbivore = d;
    } else if (o.diet === "carnivore" && d < dCarnivore) {
      closestCarnivore = o; dCarnivore = d;
    }
  }

  return { closestPlankton, closestHerbivore, closestCarnivore };
}


/**
 * STATE MACHINE FOR FISH BEHAVIOR
 */

decideAndAct(env) {
  // helper to steer toward (or away, by inverting target coords)
  const MAX_TURN = PI / 10;

function steerTowardAngle(targetAngle, boost = 1) {
  let diff = (targetAngle - this.heading + PI) % (TWO_PI) - PI;
  diff = constrain(diff, -MAX_TURN, MAX_TURN);
  this.heading = this.heading + diff;
  this.speed   = this.originalSpeed * boost;
  this.updateVelocityFromHeading();
}

  // ==== DECISION PHASE (only from wander) ====
  if (this.state === "wander") {
    // allow speed reset
    this.speed = this.originalSpeed;

    // if a carnivore is spotted first → flee
    if (this.diet === "herbivore" && env.closestCarnivore) {
      this.state      = "flee";
      this.target     = env.closestCarnivore;
      // this.speed     *= 1.5;
      this.stateTimer = this.maxStateDur.flee;

    // else if plankton is spotted → hunt
    } else if (this.diet === "herbivore" && env.closestPlankton) {
      //console.log(`${this.name} entering HUNT (plankton at ${nf(dist(this.x,this.y, env.closestPlankton.x, env.closestPlankton.y),1,1)}px)`); 
      this.state      = "hunt";
      this.target     = env.closestPlankton;
      this.stateTimer = this.maxStateDur.hunt;

    // carnivores hunt herbivores
    } else if (this.diet === "carnivore" && env.closestHerbivore) {
      this.state      = "hunt";
      this.target     = env.closestHerbivore;
      // this.speed     *= 1.2;
      this.stateTimer = this.maxStateDur.hunt;
    }
  }

  // ==== ACTION PHASE (steer & countdown) ====
  switch (this.state) {
    case "hunt":
      if (this.target && this.target.alive) {
        let targetAngle = atan2(this.target.y - this.y, this.target.x - this.x);
        steerTowardAngle.call(this, targetAngle, 1);
      }
      this.stateTimer -= deltaTime;
      if (this.stateTimer <= 0 || !this.target?.alive) {
        this.state = "wander";
        this.target = null;
      }
      break;

    case "flee":
      if (this.target && this.target.alive) {
        let awayAngle = atan2( this.y - this.target.y,
                              this.x - this.target.x );
        steerTowardAngle.call(this, awayAngle, 1.2);
      }
      this.stateTimer -= deltaTime;
      if (this.stateTimer <= 0) {
        this.state = "wander";
        this.target = null;
      }
      break;

    case "wander":
      const jitter = random(-MAX_TURN/2, MAX_TURN/2);
      this.heading += jitter;
      this.updateVelocityFromHeading();

    default:
      break;
  }
}

  /**
   *  Checks if this fish can eat the other fish
   */

  updateVelocityFromHeading() {
    this.vx = cos(this.heading) * this.speed;
    this.vy = sin(this.heading) * this.speed * 0.4;
  }

  eatFish(other) {
    if (this === other || !other.alive || this.attackCooldown > 0) return false;
    

    if (other.invincibleTimer > 0) {
      return false;
    }
    // Check eating cooldown
    let now = millis();
    if (now - this.lastEatTime < this.eatCooldown) {
      return false; // Still on cooldown
    }

    // Calculate base damage based on size, aggression, and difference
    const baseDamage = (this.size * 0.5 + this.aggression * 8) - (other.size * 0.25);
    const finalDamage = max(baseDamage, 5); // Minimum dmg

    other.health -= finalDamage;
    this.lastEatTime = now; // Reset cooldown timer

    // console.log(`${this.diet} fish attacked ${other.diet}, dealing ${finalDamage.toFixed(1)} damage (HP left: ${other.health.toFixed(1)})`);

    if (other.health <= 0) {
      other.alive = false;
      this.energy += other.size * 5; // Reward only on kill
      // console.log(`${this.diet} fish killed and ate ${other.diet}`);
      return true;
    }

    return false;
  }

    /**
     *  Checks if this fish can breed with the other fish
     */
    breed(other) {
      // Current time in milliseconds
      let now = millis();
      
      // Breeding cooldown (2 seconds)
      let breedCooldown = 2000;
      
      // Check all breeding conditions
      if (
        // Check if either fish is on cooldown
        (now - this.lastBreedTime < breedCooldown) ||
        (now - other.lastBreedTime < breedCooldown) ||
        
        // Check if either fish is too young (age in frames)
        (this.age < 100) ||
        (other.age < 100) ||
        
        // Check if either fish has insufficient energy
        (this.energy < 30) ||
        (other.energy < 30) ||
        
        // Check salinity compatibility
        (Math.abs(this.salinityPreference - other.salinityPreference) > 
         Math.min(this.salinityTolerance, other.salinityTolerance))) {
        
        return null; // Breeding conditions not met
      }
    
      // Genetic recombination with mutation
      let rand = seededRandom; // Use seeded random for consistency
      let newTraits = {
        speed: ((this.traitSpeed + other.traitSpeed) / 2) * (0.9 + 0.2 * rand()),
        size: (this.size + other.size) / 2 * (0.9 + 0.2 * rand()),
        finSize: (this.finSize + other.finSize) / 2 * (0.9 + 0.2 * rand()),
        color: lerpColor(color(this.color), color(other.color), 0.3 + 0.4 * rand()),
        aggression: (this.aggression + other.aggression) / 2 * (0.9 + 0.2 * rand()),
        lifespan: (this.lifespan + other.lifespan) / 2 * (0.9 + 0.2 * rand()),
        salinityPreference: (this.salinityPreference + other.salinityPreference) / 2 + (-5 + 10 * rand()),
        salinityTolerance: (this.salinityTolerance + other.salinityTolerance) / 2 + (-5 + 10 * rand()),
        name: fishnames[floor(rand() * fishnames.length)],
        diet: (this.diet === other.diet) ? this.diet : (rand() < 0.5 ? this.diet : other.diet),
        health: 100
      };
    
      // Set breeding cooldowns
      this.lastBreedTime = now;
      other.lastBreedTime = now;
      
      // Reduce energy from breeding
      this.energy -= 30;
      other.energy -= 30;
    
      return new Fish(
        (this.x + other.x) / 2,
        (this.y + other.y) / 2,
        newTraits,
        rand
      );
    }

  update(fishArray) {
    if (!this.isAlive()) {
      fishArray.splice(fishArray.indexOf(this), 1);
      return;
    }

    // if (this.health <= 0) {
    //   this.alive = false;
    //   return;
    // }

    if (this.invincibleTimer > 0) {
        this.invincibleTimer -= tickSpeed / 60; // Assuming 60 FPS base
    }

    //speed increases energy consumption
    const speedFactor = this.speed || 1;
    const sizeFactor = this.size || 1;
    this.energy -= 0.001 * speedFactor * sizeFactor * tickSpeed;

    // fish loses health if salinity is outside its tolerance range
    const deviation = Math.abs(salinityLevel - this.salinityPreference);
    if (deviation > this.salinityTolerance) {
      const overTolerance = deviation - this.salinityTolerance;

      // Quadratic penalty: further away = much more damage
      const penalty = Math.pow(overTolerance, 2) * 0.001; // 

      this.health -= penalty * tickSpeed;
      

    }
   // Decision-making cooldown
  // BEFORE any collision / movement code:
if (millis() - this.lastDecisionTime > this.decisionCooldown) {
  const env = this.getEnvironment(planktonArray, fishArray);
  this.decideAndAct(env);
  this.lastDecisionTime = millis();
}

    // Collision Check
    let other = this.checkCollision(fishArray);
    if (other) {
      // Attempt to breed first
      let offspring = this.breed(other);
      if (offspring) {
        fishArray.push(offspring);
      // Attempt to eat if breeding didnt work
      } else if (this.diet === "carnivore" && other.diet !== "plankton" && this.eatFish(other) && other.invincibleTimer <= 0) {
        fishArray.splice(fishArray.indexOf(other), 1);
      }
    }
    this.move();
    this.checkBounds();

    //natural regeneration
    if (this.energy > 100 && this.health < this.maxHealth) {
      this.health = min(this.maxHealth, this.health + 10 * (tickSpeed / 60));
    }

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
// BODY (main ellipse) with diet outline
  push();
  if (this.diet === "carnivore") {
    stroke(255, 0, 0); // Red outline
  } else if (this.diet === "herbivore") {
    stroke(0, 255, 0); // Green outline
  } else {
    noStroke(); // No outline
  }
  strokeWeight(2);
  fill(this.color);
  ellipse(0, 0, this.size, this.size * 0.6);
  pop();


  /*
  fill(this.color);
  noStroke();
  ellipse(0, 0, this.size, this.size * 0.6);
  */


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