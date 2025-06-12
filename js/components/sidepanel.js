//sidepanel.js
class SidePanel {
  constructor(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.originalH  = h;          // collapsed height
    this.expandedH  = h + 300;    // height when fish selected
    this.currentH   = h;          // height actually drawn 
  }

  display(fish) {
    const targetH = fish ? this.expandedH : this.originalH;

    this.currentH = lerp(this.currentH, targetH, 0.15);

    push();
    const bgAlpha = fish ? 245 : 80;
    fill(255, 240, 210, bgAlpha);
    stroke(120, 100, 60, bgAlpha);
    rect(this.x, this.y, this.w, this.currentH, 24);

    fill(50);
    textAlign(LEFT, TOP);
    textSize(22);
    text('Selected Fish', this.x - 64, this.y + 24);

    if (fish) {
      const lineHeight = 20;
      const leftX  = this.x - this.w / 2 + 80;
      const rightX = this.x + 30;
      let   rowY   = this.y + 60;

      const stats = [
        ['Name',        fish.name],
        ['State',       fish.state],
        ['Energy',      fish.energy.toFixed(1)],
        ['Health',      fish.health.toFixed(1)],
        ['Size',        fish.size.toFixed(2)],
        ['Age',         fish.age.toFixed(0)],
        ['Speed',       fish.speed.toFixed(2)],
        ['Size',        fish.size.toFixed(2)],
        ['Aggression',  (fish.aggression*100).toFixed(1) + '%'],
        ['Diet',        fish.diet],
        ['Salinity',    `${fish.salinityPreference.toFixed(1)}%`],
        ['Tolerance',   `±${fish.salinityTolerance.toFixed(1)}`],
        ['Alive',       fish.alive ? 'Yes' : 'No']
      ];

      textSize(14);
      for (const [label, value] of stats) {
        fill(70);   textSize(17); text(label + ':', leftX, rowY);
        fill(30);   textSize(12); text(value,     rightX, rowY);
        rowY += lineHeight;
      }
    } else {
      textSize(16);
      fill(120);
      text('Click a fish to see stats.', this.x - 96, this.y + 80);
    }
    pop();
  }
}
