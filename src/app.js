import io from 'socket.io-client';
// let socket = io.connect( 'http://localhost:8080' );

export class App {
  configureRouter(config, router){
    config.title = 'Chat';
    config.map([
      { route: '', moduleId: 'views/login', title: 'Login', name: "login"},
      { route: 'chat', moduleId: 'views/chat', title: 'Chatroom', name: "chatroom" }
    ]);

    this.router = router;
  }
}
