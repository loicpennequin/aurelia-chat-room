import {inject} from 'aurelia-framework';
import {LoginService} from '../services/loginService';
import {Router} from 'aurelia-router';


@inject(LoginService, Router)
export class Login {
  constructor(LoginService, Router, io) {
    this.loginService = LoginService;
    this.router = Router;
    this.username = LoginService.get();
  }

  login(){
      this.loginService.set(this.username);
      this.router.navigateToRoute('chatroom');
  }
}
