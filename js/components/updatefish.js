//updatefish.js
function updateAndDrawFish() {
  // Temporary array for this frame's new fish
  let newFish = []; 

  // Update all existing fish
  for (let fish of fishArray) {
    fish.update(fishArray);
  }

  // Check interactions
  fishArrayCollision(fishArray, newFish);

  // Add all new fish to main array
  if (newFish.length > 0) {
    fishArray.push(...newFish); 
  }

  //Remove dead fish and display survivors
  for (let i = fishArray.length - 1; i >= 0; i--) {
    if (fishArray[i].alive) {
      fishArray[i].display();
    } else {
      fishArray.splice(i, 1);
    }
  }
}


/**
 * Checks for interactions between all fish
 * attempts to breed and eat
 */
function fishArrayCollision(fishArray, newFish) {
  // Check interactions
  for (let i = 0; i < fishArray.length; i++) {
    if (!fishArray[i].alive) continue;
    
    let other = fishArray[i].checkCollision(fishArray);
    if (other && other.alive) {
      let offspring = fishArray[i].breed(other);
      if (offspring) {
        newFish.push(offspring);  // Store in temporary array
        fishArray[i].energy = max(fishArray[i].energy - 45, 0);
        other.energy = max(other.energy - 45, 0);
      } else if (fishArray[i].diet === "carnivore" && other.diet !== "plankton"&& other.invincibleTimer <= 0) {
        fishArray[i].eatFish(other);
      }
    }
  }
}
