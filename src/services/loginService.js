export class LoginService{
  constructor(){
    this.username = "";
  }

  set(username){
    this.username = username;
  }

  get(){
    return this.username
  }
}
