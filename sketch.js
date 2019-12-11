var canvas;

var ph = 0;
var xl; // ldv pos
var ml; // mirror length 
var x = [];
var n = 120;
var y0 = [];
var y1 = [];

var fl;
var mx, my;
var mag1 = 3;
var sp1 = 5.0;
var ag = 10;
var cor = false;
var lx; // laser posx
var yl; // laser posy
var x1; // laser intercept x

var cg; // current angle for displacement
var sg; // current angle for velocity
var ps = [];
var pause;
var cx; // max amplitude
var json = {};

function setup() 
{
  canvas = createCanvas(750, 400);
  textSize(15);
  noStroke();
  frameRate(5); 
  angleMode(DEGREES);
  xl = 50;
  yl = 260 - 100;
  mx = 400;
  my = 100 * 1.5 - 100;
  lx = 170;
  fl = 600;
  ml = 200 * 1.1;
  ps.push(createVector(0,0));  
  pause = false;
  draw();
}

function draw() 
{
  if (pause)  return;

  background(255);
  
  smooth();

  update_frame();

  draw_ldv(xl, yl);

  draw_mirror(mx, my);
  
  draw_laser(lx, yl);

  update_plot();

  draw_text();
}

function fm(n, d)
{
  return n.toLocaleString('en-us', 
    { minimumFractionDigits: 1 });
}

function draw_text()
{
  fill(0);
  strokeWeight(0.1);
  stroke(0);
  var t1 = "Angle: " + cg.toFixed(1) + " degrees."
  text(t1, 50, 15);
}

function intercept(px, py)
{
  var maxdist = 800;
  var x2 = px;
  for(var i = 0; i<maxdist; ++i)
  {
    x2 = px + i;
    var c = get(x2, py);
    if (c[0] < 255)  break;
  }
  return x2;
}

function update_frame()
{
  var f = 2;
  cg = ag*sin(ph*f)-20;
  sg = ag*cos(ph*f)-20;
  ph = ph + sp1;
}

function update_plot()
{ 
  var dy = yl-my;
  var dx = tan(sg)*dy;
  var mr = createVector(dx, dy);

  cx = mr.mag() * sin(sg); // max displacement
  yv = mr.x / 6.5;

  var i = x.length;
  if (i<n)
  {
    x[i] = ph;
  }

  i = y0.length;
  y0[i] = yv;
  
  // y1 curve
  az = cg;

  var m1 = createVector(mx, my);
  var m2 = createVector(x1, yl);
  var mr2 = p5.Vector.sub(m2,m1);

  var wd = 10;

  if (Math.abs(cg)>2.0)
  {
    y1[i] = 2 * cos(az) * y0[i];
  }
  else
  {
    y1[i] = y0[i];
  }

  if (i>=n)
  {
    y0.shift();
    y1.shift();
  }
}

function draw_incident(px, py, ax, ay)
{
  stroke(100, 0, 0, 150);
  strokeWeight(4);
  line(px, py, ax, ay);
  stroke(250, 150, 150, 100);
  strokeWeight(8);
  line(px, py, ax, ay);
}

function get_normal(px, py)
{
  var m1 = createVector(mx, my);
  var m2 = createVector(px, py);
  var nv = p5.Vector.sub(m2, m1);  
  var nm = createVector(-nv.y, nv.x);
  nm.normalize();
  return nm;
}

function draw_laser(px, py)
{
  x1 = intercept(px, py);

  draw_incident(px, py, x1, py);

  var nv = get_normal(x1, py);

  var incidence = createVector(1, 0);
  var dot = incidence.dot(nv);
  var velocity = createVector(-1,0);
  velocity.set(2*nv.x*dot - incidence.x, 2*nv.y*dot - incidence.y, 0);

  var tl = fl-x1;  
  if (tl<0) return;
  velocity.mult(-tl);

  nv.mult(60);
  
  stroke(10,10,10, 128);
  strokeWeight(1);
  fill(0,0,0,128)
  line(x1, py, x1 + nv.x, py + nv.y);

  stroke(100, 0, 0, 150);
  strokeWeight(4);
  line(x1, py, x1 + velocity.x, py + velocity.y);
  stroke(250, 150, 150, 100);
  strokeWeight(8);
  line(x1, py, x1 + velocity.x, py + velocity.y);

  if (!pause)
    ps.push(createVector(x1 + velocity.x, py + velocity.y));

  stroke(50, 100, 150, 150);
  strokeWeight(3);
  for(var i = 0; i<ps.length-1; ++i)
  {
    if (ps[i].x == 0)
      continue;

    if ((ps[i+1].y+7)>py && (ps[i].y-7)<py)    
      continue;
    if ((ps[i+1].y-7)<py && (ps[i].y+7)>py)
      continue;
    line(ps[i].x, ps[i].y, ps[i+1].x, ps[i+1].y);
  }

  var mn = 80;
  if (ps.length>mn)
    ps.shift();

  var xx = []
  var yy = []

  for(var i = 0; i<ps.length; ++i)
  {
    xx[i] = ps[i].x;
    yy[i] = ps[i].y;
  }
  
  json.xx = JSON.stringify(xx);
  json.yy = JSON.stringify(yy);
}

function draw_mirror(px, py)
{
  push();
  translate(px, py);
  ellipse(0,0, 5, 5);
  rotate(cg);  
  noStroke();
  
  fill(50, 200, 200, 128);
  rect(0, 0, 15, ml);
  
  // stroke(0,0,255);
  // bezier(0, 0, -125, ml*0.25, -125, ml*0.75, 0, ml);
  
  fill(50, 50, 200, 128);
  noStroke();
  rect(0, ml/2-5, 15, 30);
  pop();
}

function draw_ldv(xl, yl)
{
  push();
  fill(100);
  noStroke();
  var yt1 = yl-40;
  var yt2 = yl-15;
  rect(xl, yt1, 100, 80);
  rect(xl+100, yt2, 20, 30);
  pop();
}

function doubleClicked() 
{
  pause = !pause;
}