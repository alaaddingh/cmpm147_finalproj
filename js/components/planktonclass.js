//planktonclass.js
class Plankton {

    constructor(x, y, properties = {}, rand = Math.random) {
        this.x = x;
        this.y = y;
        this.size = properties.size;
        this.speed = properties.speed;
        this.setInitialMotion(rand); 
    }


    /**
     * Random Motion for Plankton
     */
    setInitialMotion() {
        let angle = random(-PI / 4, PI / 4);
        if (random() < 0.5) angle += PI;
        this.vx = cos(angle) * this.speed;
        this.vy = sin(angle) * this.speed * 0.3;
    }
    /**
     * Checks if plankton is within the tank. 
     */
    checkBounds() {
        if (this.x - this.size / 2 < TANK.left() || this.x + this.size / 2 > TANK.right()) {
            this.vx *= -1;
            this.x = constrain(this.x, TANK.left() + this.size / 2, TANK.right() - this.size / 2);
        }
        if (this.y - this.size / 2 < TANK.top() || this.y + this.size / 2 > TANK.bottom()) {
            this.vy *= -1;
            this.y = constrain(this.y, TANK.top() + this.size / 2, TANK.bottom() - this.size / 2);
        }
    }

    /**
     * determines if a given fish has collided with plankton
     */
    isCollidingWith(fish) {
        return dist(this.x, this.y, fish.x, fish.y) < (this.size / 2 + fish.size / 2);
    }

    /**
     * Plankton Design
     */
    display() {
        fill(100, 200);
        noStroke();
        ellipse(this.x, this.y, this.size, this.size);
    }

    /**
     * Updates plankton position
     */
    update() {
        this.x += this.vx * tickSpeed;
        this.y += this.vy * tickSpeed;
        this.checkBounds();
    }

}
