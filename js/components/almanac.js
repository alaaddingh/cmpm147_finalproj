// almanac.js
class Almanac {
    constructor() {
        this.visible = false;
        this.page = 0;
        this.entriesPerPage = 6;
        this.button = null;
        this.titleFontSize = 24;
        this.bodyFontSize = 14;
        this.padding = 15;
        this.entryWidth = 280;
        this.entryHeight = 180;
        this.lastPageChange = 0; // Timestamp of last page change
        this.pageChangeCooldown = 300; // 300ms cooldown between page changes
        this.buttonX = 100;
        this.buttonY = 500;
        this.buttonBaseSize = 200;
        this.buttonHoverSize = 450;
        this.buttonCurrentSize = this.buttonBaseSize;
    }
     preload() {
    almanacButtonImage = loadImage('assets/fishalmanac.png');
    }
  
    setup() {
    this.button = createImg('assets/fishalmanac.png', 'Open Almanac');
    this.button.addClass('almanac-btn');      
this.button.position(this.buttonX, this.buttonY);
this.button.size(200, 200);              
this.button.mousePressed(() => this.toggle());
    this.button.position(this.buttonX, this.buttonY);
    this.button.size(this.buttonBaseSize, this.buttonBaseSize);
    this.button.mousePressed(() => this.toggle());
    this.button.style('cursor', 'pointer');
    }

  
    toggle() {
        this.visible = !this.visible;
        this.page = 0; // Reset to first page when opening
        this.lastPageChange = millis(); // Reset cooldown when opening
    }
   update() {
    
}

    display() {
        if (!this.visible || fishArray.length === 0) return;

        // Draw almanac window
        fill(240, 230, 200);
        stroke(180);
        strokeWeight(3);
        rect(width/2, height/2, width*0.4, height*0.9, 20);

        // Title and fish count
        fill(50);
        noStroke();
        textSize(32);
        textAlign(CENTER, CENTER);
        text(`Current Fish: ${fishArray.length}`, width/2, height*0.1);

        // Display current page of fish entries
        this.displayFishEntries();
        
        // Page navigation
        this.displayPageNavigation();
        
        // Close button
        if (this.drawButton(width/2, height/2 + height*0.425, "Close", 80, 40)) {
            this.visible = false;
        }
    }
  
    displayFishEntries() {
        let cols = 2;
        let startY = height/2 - height*0.25;
        let entrySpacing = this.entryHeight + this.padding;
        
        // Calculate start and end indices for current page
        let startIdx = this.page * this.entriesPerPage;
        let endIdx = min(startIdx + this.entriesPerPage, fishArray.length);
        
        for (let i = startIdx; i < endIdx; i++) {
            let fish = fishArray[i];
            let col = (i - startIdx) % cols;
            let row = floor((i - startIdx) / cols);
            
            let x = width/2 - this.entryWidth/2 - this.padding/2 + col * (this.entryWidth + this.padding);
            let y = startY + row * entrySpacing;
            
            this.displayFishEntry(fish, x, y);
        }
    }
  
    displayFishEntry(fish, x, y) {
        // Entry background with different color for carnivores/herbivores
        if (fish.diet === "carnivore") {
            fill(255, 230, 230); // Light red
        } else {
            fill(230, 255, 230); // Light green
        }
        
        stroke(200);
        strokeWeight(2);
        rect(x, y, this.entryWidth, this.entryHeight, 10);
        
        // Fish ID/name
        fill(50);
        textSize(this.titleFontSize);
        textAlign(LEFT, TOP);
        textFont('Segoe UI', this.titleFontSize);
        textStyle(BOLD);
        text(fish.name, x - this.entryWidth/2 + this.padding,
            y - this.entryHeight/2 + this.padding);
        textStyle(NORMAL);

        
        // Fish sprite
        push();
        translate(x - this.entryWidth/2 + this.padding + 40, y - this.entryHeight/2 + this.padding + 40);
        scale(0.4);
        this.drawMiniFish(fish);
        pop();
        
        // Fish stats
        textSize(this.bodyFontSize);
        let statsY = y - this.entryHeight/2 + this.padding;
        let stats = [
            'Name: ' + fish.name,
            `Age: ${floor(fish.age / 10)}` ,
            `Energy: ${floor(fish.energy)}`,
            `Health: ${floor(fish.health)}`,
            `Speed: ${fish.speed.toFixed(1)}`,
            `Size: ${fish.size.toFixed(1)}`,
            `Aggression: ${fish.aggression.toFixed(1) * 100} %`,
            `Diet: ${fish.diet}`,
            `Salinity: ${fish.salinityPreference.toFixed(0)}% ±${fish.salinityTolerance.toFixed(0)}`
        ];
        
        for (let stat of stats) {
            text(stat, x - this.entryWidth/2 + this.padding + 100, statsY);
            statsY += 16;
        }
        

    }
  
    //Prob would be best to access the drawing logic from fishclass.js for reusability
    drawMiniFish(fish) {
        push();
        
        // Body
        fill(fish.color);
        noStroke();
        ellipse(0, 0, fish.size, fish.size * 0.6);
        
        // Head
        fill(lerpColor(fish.color, color(255), 0.2));
        ellipse(fish.size * 0.25, 0, fish.size * 0.5, fish.size * 0.5 * 0.6);
        
        // Tail
        fill(lerpColor(fish.color, color(255), 0.5));
        triangle(
            -fish.size/2, 0,
            -fish.size/2 - fish.finSize, -fish.size/6,
            -fish.size/2 - fish.finSize, fish.size/6
        );

        // Top fin
        fill(lerpColor(fish.color, color(255,255,255), 0.3));
        beginShape();
        vertex(-fish.size * 0.1, -fish.size * 0.3);
        bezierVertex(
            0, -fish.size * 0.7,
            fish.finSize * 0.5, -fish.size * 0.7,
            fish.size * 0.2, -fish.size * 0.3
        );
        endShape(CLOSE);

        // Bottom fin
        fill(lerpColor(fish.color, color(0,0,0), 0.2));
        ellipse(0, fish.size * 0.25, fish.finSize * 0.7, fish.finSize * 0.3);
        
        // Eye
        fill(255);
        ellipse(fish.size * 0.18, -fish.size * 0.1, fish.size * 0.13);
        fill(0);
        ellipse(fish.size * 0.18, -fish.size * 0.1, fish.size * 0.07);
        
        // Aggression eyebrow
        if (fish.aggression > 0.5) {
            stroke(60, 30, 30);
            strokeWeight(3);
            line(
                fish.size * 0.13, -fish.size * 0.18,
                fish.size * 0.23, -fish.size * 0.14
            );
            noStroke();
        }
        
        pop();
    }
  
    canChangePage() {
        // Check if enough time has passed since last page change
        return millis() - this.lastPageChange > this.pageChangeCooldown;
    }
  
    displayPageNavigation() {
        let totalPages = ceil(fishArray.length / this.entriesPerPage);
        if (totalPages <= 1) return;
        
        // Previous button
        if (this.page > 0) {
            let prevPressed = this.drawButton(width/2 - 100, height/2 + height*0.425, "Previous", 60, 40);
            if (prevPressed && this.canChangePage()) {
                this.page--;
                this.lastPageChange = millis();
            }
        }
        
        // Page indicator
        fill(50);
        textSize(16);
        textAlign(CENTER, CENTER);
        text(`Page ${this.page + 1} of ${totalPages}`, width/2, height/2 + height*0.35);
        
        // Next button
        if (this.page < totalPages - 1) {
            let nextPressed = this.drawButton(width/2 + 100, height/2 + height*0.425, "Next", 60, 40);
            if (nextPressed && this.canChangePage()) {
                this.page++;
                this.lastPageChange = millis();
            }
        }
    }
  
    drawButton(x, y, label, w = 100, h = 30) {
        let over = mouseX > x - w/2 && mouseX < x + w/2 && 
                  mouseY > y - h/2 && mouseY < y + h/2;
        
        fill(180, 115, 100)
        stroke(180, 90, 80);
        strokeWeight(2);
        rect(x, y, w, h, 5);
        
        fill(50);
        noStroke();
        textSize(14);
        textAlign(CENTER, CENTER);
        text(label, x, y);
        
        return over && mouseIsPressed;
    }
}

let almanac = new Almanac();