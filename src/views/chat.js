import {inject} from 'aurelia-framework';
import {LoginService} from '../services/loginService';
import {Router} from 'aurelia-router';
import io from 'socket.io-client';

let socket;

@inject(LoginService, io, Router)
export class Chat {
  constructor(LoginService, io, Router) {
    this.loginService = LoginService;
    this.io = io;
    this.username = LoginService.get();
    this.router = Router;
    this.users = [];
    this.messages = [];
    this.newPost = "";
  }

  activate(){
    if (this.username === ""){
      this.router.navigateToRoute('login');
    } else {
      socket = this.io.connect( 'http://localhost:8080' );
      socket.emit('user joined chatroom', this.username)

      socket.on('connection succesful', (users)=>{
        this.users = users;
      });

      socket.on('user joined', (data)=>{
        this.users = data.users;
        this.messages.push(data.message);
      });

      socket.on('user left', (data)=>{
        this.users = data.users;
        console.log(this.users);
        this.messages.push(data.message);
      });

      socket.on('new post', (post)=>{
        this.messages.push(post);
        setTimeout(()=>{
          let chatbox = document.querySelector(".chatbox");
          chatbox.scrollTop = chatbox.scrollHeight;

        })
      });
    }
  }

  post(){
    if (this.newPost !== ""){
      socket.emit('new post', this.newPost)
      this.newPost = "";
    }
  }
}
