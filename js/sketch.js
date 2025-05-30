let img;
let cnv;


function preload() {
  img = loadImage('./assets/melvins_fishtank.png'); 
}

function setup() {
  background(100);
  cnv = createCanvas(windowWidth, windowHeight);
  cnv.position(0, 0); 
  imageMode(CENTER); 
}



function draw() {
  tankbackground();
}