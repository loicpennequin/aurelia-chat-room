define('app',['exports', 'socket.io-client'], function (exports, _socket) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.App = undefined;

  var _socket2 = _interopRequireDefault(_socket);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var App = exports.App = function () {
    function App() {
      _classCallCheck(this, App);
    }

    App.prototype.configureRouter = function configureRouter(config, router) {
      config.title = 'Chat';
      config.map([{ route: '', moduleId: 'views/login', title: 'Login', name: "login" }, { route: 'chat', moduleId: 'views/chat', title: 'Chatroom', name: "chatroom" }]);

      this.router = router;
    };

    return App;
  }();
});
define('environment',["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = {
    debug: true,
    testing: true
  };
});
define('main',['exports', './environment'], function (exports, _environment) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.configure = configure;

  var _environment2 = _interopRequireDefault(_environment);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  function configure(aurelia) {
    aurelia.use.standardConfiguration().feature('resources');

    if (_environment2.default.debug) {
      aurelia.use.developmentLogging();
    }

    if (_environment2.default.testing) {
      aurelia.use.plugin('aurelia-testing');
    }

    aurelia.start().then(function () {
      return aurelia.setRoot();
    });
  }
});
define('services/loginService',["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var LoginService = exports.LoginService = function () {
    function LoginService() {
      _classCallCheck(this, LoginService);

      this.username = "";
    }

    LoginService.prototype.set = function set(username) {
      this.username = username;
    };

    LoginService.prototype.get = function get() {
      return this.username;
    };

    return LoginService;
  }();
});
define('views/chat',['exports', 'aurelia-framework', '../services/loginService', 'aurelia-router', 'socket.io-client'], function (exports, _aureliaFramework, _loginService, _aureliaRouter, _socket) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.Chat = undefined;

  var _socket2 = _interopRequireDefault(_socket);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var _dec, _class;

  var socket = void 0;

  var Chat = exports.Chat = (_dec = (0, _aureliaFramework.inject)(_loginService.LoginService, _socket2.default, _aureliaRouter.Router), _dec(_class = function () {
    function Chat(LoginService, io, Router) {
      _classCallCheck(this, Chat);

      this.loginService = LoginService;
      this.io = io;
      this.username = LoginService.get();
      this.router = Router;
      this.users = [];
      this.messages = [];
      this.newPost = "";
    }

    Chat.prototype.activate = function activate() {
      var _this = this;

      if (this.username === "") {
        this.router.navigateToRoute('login');
      } else {
        socket = this.io.connect('http://localhost:8080');
        socket.emit('user joined chatroom', this.username);

        socket.on('connection succesful', function (users) {
          _this.users = users;
        });

        socket.on('user joined', function (data) {
          _this.users = data.users;
          _this.messages.push(data.message);
        });

        socket.on('user left', function (data) {
          _this.users = data.users;
          console.log(_this.users);
          _this.messages.push(data.message);
        });

        socket.on('new post', function (post) {
          _this.messages.push(post);
          setTimeout(function () {
            var chatbox = document.querySelector(".chatbox");
            chatbox.scrollTop = chatbox.scrollHeight;
          });
        });
      }
    };

    Chat.prototype.post = function post() {
      if (this.newPost !== "") {
        socket.emit('new post', this.newPost);
        this.newPost = "";
      }
    };

    return Chat;
  }()) || _class);
});
define('views/login',['exports', 'aurelia-framework', '../services/loginService', 'aurelia-router'], function (exports, _aureliaFramework, _loginService, _aureliaRouter) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.Login = undefined;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var _dec, _class;

  var Login = exports.Login = (_dec = (0, _aureliaFramework.inject)(_loginService.LoginService, _aureliaRouter.Router), _dec(_class = function () {
    function Login(LoginService, Router, io) {
      _classCallCheck(this, Login);

      this.loginService = LoginService;
      this.router = Router;
      this.username = LoginService.get();
    }

    Login.prototype.login = function login() {
      this.loginService.set(this.username);
      this.router.navigateToRoute('chatroom');
    };

    return Login;
  }()) || _class);
});
define('resources/index',["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.configure = configure;
  function configure(config) {}
});
define('text!app.html', ['module'], function(module) { module.exports = "<template><router-view class=\"col-md-8\"></router-view></template>"; });
define('text!app.css', ['module'], function(module) { module.exports = "body {\n  font-family: 'Helvetica', 'Arial', sans-serif; }\n\nul {\n  list-style: none;\n  padding-left: 0; }\n"; });
define('text!views/chat.html', ['module'], function(module) { module.exports = "<template><require from=\"./chat.css\"></require><require from=\"../app.css\"></require><h1>Hello, ${username} !</h1><section><main><div class=\"chatbox\"><p repeat.for=\"msg of messages\">${msg}</p></div><form submit.trigger=\"post()\"><input type=\"text\" value.bind=\"newPost\"> <input type=\"submit\" value=\"Send\"></form></main><aside><h2>Users</h2><ul><li repeat.for=\"user of users\">${user.username}</li></ul></aside></section></template>"; });
define('text!views/login.html', ['module'], function(module) { module.exports = "<template><require from=\"./login.css\"></require><require from=\"../app.css\"></require><main><h1>Please select a Username</h1><form submit.trigger=\"login()\"><input type=\"text\" value.bind=\"username\"> <input type=\"submit\" name=\"\" value=\"log in\"></form></main></template>"; });
define('text!views/chat.css', ['module'], function(module) { module.exports = "* {\n  box-sizing: border-box; }\n\nh1 {\n  text-align: center; }\n\nsection {\n  height: 80vh;\n  max-width: 1200px;\n  margin: 0 auto;\n  display: flex;\n  flex-flow: row wrap;\n  border: solid #666 1px; }\n\nmain {\n  font-size: 1.2em;\n  width: 80%;\n  float: left;\n  height: 100%;\n  display: flex;\n  flex-flow: column; }\n  main .chatbox {\n    padding: 15px;\n    overflow-y: scroll; }\n  main form {\n    background-color: #bbb;\n    padding: 5px;\n    margin-top: auto;\n    font-size: 1.1em; }\n    main form input[type='text'] {\n      width: 90%; }\n\naside {\n  width: 20%;\n  float: right;\n  background-color: gray;\n  height: 100%;\n  padding: 15px; }\n"; });
define('text!views/login.css', ['module'], function(module) { module.exports = "main {\n  height: 100vh;\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  flex-flow: column wrap; }\n"; });
//# sourceMappingURL=app-bundle.js.map