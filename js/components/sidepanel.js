class SidePanel {
  constructor(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
  }

  display(fish) {
    push();
    fill(255, 240, 210, 245);
    stroke(90, 60, 40, 180);
    rect(this.x, this.y, this.w, this.h, 20);

    fill(50);
    textAlign(LEFT, TOP);
    textSize(22);
    text("Selected Fish", this.x + 24, this.y + 24);

    textSize(16);
    if (fish) {
      let lines = [
        `Energy: ${fish.energy.toFixed(1)}`,
        `Age: ${fish.age.toFixed(0)}`,
        `Speed: ${fish.speed.toFixed(2)}`,
        `Size: ${fish.size.toFixed(2)}`,
        `Aggression: ${fish.aggression.toFixed(2)}`,
        `Lifespan: ${fish.lifespan.toFixed(1)}`,
        `Salinity Pref: ${fish.salinityPreference.toFixed(1)}`,
        `Salinity Tol: ${fish.salinityTolerance.toFixed(1)}`,
        `Alive: ${fish.alive ? "Yes" : "No"}`
      ];
      for (let i = 0; i < lines.length; i++) {
        text(lines[i], this.x + 24, this.y + 64 + i * 32);
      }
    } else {
      textSize(18);
      fill(120);
      text("Click a fish to see stats.", this.x + 24, this.y + 80);
    }
    pop();
  }
}
