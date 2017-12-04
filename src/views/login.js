import {inject} from 'aurelia-framework';
import {LoginService} from '../services/loginService';
import {Router} from 'aurelia-router';
import p5 from 'p5';

var s = function( sketch ) {

  let bubbles = [];

  sketch.setup = function(){
    let canvas = sketch.createCanvas(sketch.windowWidth, sketch.windowHeight);
    canvas.parent('sketch')
    sketch.background(255);
    sketch.fill(0);
    for (let i = 0 ; i < 20; i++){
      bubbles.push(new Bubble(sketch.random(sketch.width), sketch.random(sketch.height), sketch.random(100,300)));
    }
  }

  sketch.draw = function(){
    sketch.background(255);
    bubbles.forEach((b)=>{
      b.update();
      b.display();
    })
  }

  function windowResized() {
    sketch.resizeCanvas(sketch.windowWidth, 480);
  }

  function Bubble(x, y, maxRadius){
    this.pos = sketch.createVector(x, y);
    this.vel = sketch.createVector(sketch.random(-2,2), sketch.random(-2,2))
    this.radius = maxRadius;
    this.maxRadius = maxRadius;
  }

  Bubble.prototype.update = function(){
    this.move();
    // this.grow();
  }

  Bubble.prototype.display = function(){
    sketch.ellipse(this.pos.x, this.pos.y, this.radius)
  }

  Bubble.prototype.move = function(){
    this.pos.add(this.vel);
    if (this.pos.x < 0-this.radius){
      this.pos.x = sketch.width+this.radius;
    }
    if (this.pos.x > sketch.width+this.radius){
      this.pos.x = 0-this.radius;
    }
    if (this.pos.y < 0-this.radius){
      this.pos.y = sketch.width+this.radius;
    }
    if (this.pos.y > sketch.height+this.radius){
      this.pos.y = 0-this.radius;
    }
  }

  Bubble.prototype.grow = function(){
    if (this.radius <= this.maxRadius){
      this.radius += 1;
    }
  }

};

@inject(LoginService, Router)
export class Login {
  constructor(LoginService, Router) {
    this.loginService = LoginService;
    this.router = Router;
    this.username = LoginService.get();
  }

  attached(){
    this.sketch = new p5(s);
  }

  login(){
      this.loginService.set(this.username);
      this.router.navigateToRoute('chatroom');
  }
}
