export class LoginService{
  constructor(){
    this.username = "";
  }

  set(username){
    this.username = username;
    sessionStorage.setItem('username', username);
  }


  get(){
    if (this.username === "") return sessionStorage.getItem('username');
    else return this.username;
  }
}
