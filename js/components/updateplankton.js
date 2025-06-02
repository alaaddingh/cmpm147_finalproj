let energyMult = 5;
function updateAndDrawPlankton() {
    for (let i = planktonArray.length - 1; i >= 0; i--) {
        let plankton = planktonArray[i];
        plankton.update();
        plankton.display();

        for (let fish of fishArray) {
            if (plankton.isCollidingWith(fish) && fish.alive) {
                fish.energy = Math.min(fish.energy + plankton.size * energyMult, fish.maxEnergy);
                planktonArray.splice(i, 1); // Remove plankton
                break;
            }
        }
    }
}