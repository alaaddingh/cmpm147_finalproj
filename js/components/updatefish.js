function updateAndDrawFish() {
  // Temporary array for this frame's new fish
  let newFish = []; 

  // Update all existing fish
  for (let fish of fishArray) {
    fish.update(fishArray);
  }

  // Check interactions
  for (let i = 0; i < fishArray.length; i++) {
    if (!fishArray[i].alive) continue;
    
    let other = fishArray[i].checkCollision(fishArray);
    if (other && other.alive) {
      let offspring = fishArray[i].breed(other);
      if (offspring) {
        newFish.push(offspring);  // Store in temporary array
        fishArray[i].energy -= 50;
        other.energy -= 50;
      } else {
        fishArray[i].eatFish(other);
      }
    }
  }

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