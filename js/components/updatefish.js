function updateAndDrawFish() {
  for (let i = fishArray.length - 1; i >= 0; i--) {
    fishArray[i].update();
    fishArray[i].display();
    if (!fishArray[i].alive) {
      fishArray.splice(i, 1);
    }
  }
}