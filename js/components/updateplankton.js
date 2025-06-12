//updateplankton.js
let energyMult = 8;
function updateAndDrawPlankton() {
    for (let i = planktonArray.length - 1; i >= 0; i--) {
        let plankton = planktonArray[i];
        plankton.update();
        plankton.display();

        for (let fish of fishArray) {
            if (fish.alive && fish.diet === "herbivore" && plankton.isCollidingWith(fish)) {
                fish.energy = Math.min(fish.energy + plankton.size * energyMult, fish.maxEnergy);
                planktonArray.splice(i, 1);
                break;  // go to next plankton
            }
        }
    }
}