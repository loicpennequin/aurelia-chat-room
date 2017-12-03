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
    this.tabs = [];
    this. activeTab = -1;
  }

  activate(){
    if (this.username === ""){
      this.router.navigateToRoute('login');
    } else {
      socket = this.io.connect( 'http://localhost:8080' );
      socket.emit('user joined chatroom', this.username)

      socket.on('connection succesful', (users)=>{
        this.users = users;
        this.messages.push({post: 'Welcome to the channel, ' + this.username + " !"})
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

      socket.on('new pm', data=>{
        let tab = this.tabs.findIndex(tab=>tab.user.username==data.user.username);
        if (tab === -1){
          this.tabs.push({
            user: data.user,
            messages: [
              {
                user: data.user,
                post: data.post
              }
            ],
            newPost: true
          })
        } else {
          this.tabs[tab].messages.push({user: data.user, post: data.post})
          this.tabs[tab].newPost = true;
        }
      })
    }
  }

  post(){
    if (this.newPost !== ""){
      this.activeTab == -1 ?
        socket.emit('new post', this.newPost) :
        this.tabs[this.activeTab].messages.push({
          user: {username : this.username},
          post: this.newPost
        });
        socket.emit('new pm', {post : this.newPost, target :  this.tabs[this.activeTab].user});
      this.newPost = "";
    }
  }

  openTab(user){
    if (this.tabs.findIndex(tab=>tab.user == user) == -1){
      this.tabs.push({
        user: user,
        messages: [{
          post: "This is the start of your discussion with " + user.username + "."
        }],
        newPost: false
      })
    }
  }

  setActiveTab(tab){
    this.activeTab = this.tabs.indexOf(tab);
    tab.newPost = false;
  }

  closeTab(tab){
    let index = this.tabs.indexOf(tab);
    this.tabs.splice(index, 1);
  }
}
