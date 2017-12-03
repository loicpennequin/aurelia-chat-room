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
define('resources/index',["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.configure = configure;
  function configure(config) {}
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
      this.tabs = [];
      this.activeTab = -1;
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
          _this.messages.push({ post: 'Welcome to the channel, ' + _this.username + " !" });
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

        socket.on('new pm', function (data) {
          var tab = _this.tabs.findIndex(function (tab) {
            return tab.user.username == data.user.username;
          });
          if (tab === -1) {
            _this.tabs.push({
              user: data.user,
              messages: [{
                user: data.user,
                post: data.post
              }],
              newPost: true
            });
          } else {
            _this.tabs[tab].messages.push({ user: data.user, post: data.post });
            _this.tabs[tab].newPost = true;
          }
        });
      }
    };

    Chat.prototype.post = function post() {
      if (this.newPost !== "") {
        this.activeTab == -1 ? socket.emit('new post', this.newPost) : this.tabs[this.activeTab].messages.push({
          user: { username: this.username },
          post: this.newPost
        });
        socket.emit('new pm', { post: this.newPost, target: this.tabs[this.activeTab].user });
        this.newPost = "";
      }
    };

    Chat.prototype.openTab = function openTab(user) {
      if (this.tabs.findIndex(function (tab) {
        return tab.user == user;
      }) == -1) {
        this.tabs.push({
          user: user,
          messages: [{
            post: "This is the start of your discussion with " + user.username + "."
          }],
          newPost: false
        });
      }
    };

    Chat.prototype.setActiveTab = function setActiveTab(tab) {
      this.activeTab = this.tabs.indexOf(tab);
      tab.newPost = false;
    };

    Chat.prototype.closeTab = function closeTab(tab) {
      var index = this.tabs.indexOf(tab);
      this.tabs.splice(index, 1);
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
      sessionStorage.setItem('username', username);
    };

    LoginService.prototype.get = function get() {
      if (this.username === "") return sessionStorage.getItem('username');else return this.username;
    };

    return LoginService;
  }();
});
define('text!app.html', ['module'], function(module) { module.exports = "<template><router-view></router-view></template>"; });
define('text!views/chat.html', ['module'], function(module) { module.exports = "--<template><require from=\"./chat.css\"></require><require from=\"../app.css\"></require><div class=\"chat-component\"><h1>Chatroom</h1><section><main><div class=\"tabs-container\" if.bind=\"tabs.length > 0\"><ul><li click.delegate=\"activeTab = -1\" class=\"${activeTab == tabs.indexOf(tab)? 'active':''}\">General</li><li click.delegate=\"setActiveTab(tab)\" repeat.for=\"tab of tabs\" class=\"${activeTab == tabs.indexOf(tab)? 'active':''} ${tab.newPost == true && activeTab !=  tabs.indexOf(tab)? 'new-post':''}\"> ${tab.user.username} <span click.delegate=\"closeTab(tab)\">x</span></li></ul></div><div repeat.for=\"tab of tabs\" class=\"chatbox\" if.bind=\"activeTab==tabs.indexOf(tab)\"><p repeat.for=\"msg of tab.messages\"><span show.bind=\"msg.user\"><strong>${msg.user.username}</strong>:</span> <span css.bind=\"{color: msg.user?'':'gray'}\">${msg.post}</span></p></div><div class=\"chatbox\" if.bind=\"activeTab == -1\"><p repeat.for=\"msg of messages\"><span show.bind=\"msg.user\"><strong>${msg.user}</strong>:</span> <span css.bind=\"{color: msg.user?'':'gray'}\">${msg.post}</span></p></div><form submit.trigger=\"post()\"><input type=\"text\" value.bind=\"newPost\"><input type=\"submit\" value=\"Send\"></form></main><aside><h2>Users</h2><ul><li repeat.for=\"user of users\" dblclick.delegate=\"openTab(user)\">${user.username} <span show.bind=\"user.username == username\">(You)</span></li></ul></aside></section></div></template>"; });
define('text!views/login.html', ['module'], function(module) { module.exports = "<template><require from=\"./login.css\"></require><require from=\"../app.css\"></require><div class=\"login-component\"><main><h1>Please select a Username</h1><form submit.trigger=\"login()\"><input type=\"text\" value.bind=\"username\"> <input type=\"submit\" name=\"\" value=\"Log in\"></form></main></div></template>"; });
define('text!app.css', ['module'], function(module) { module.exports = "html, body {\n  font-family: 'Helvetica', 'Arial', sans-serif;\n  margin: 0;\n  padding: 0; }\n\nh1, h2, h3, h4, h5, h6 {\n  margin: 0; }\n\nul {\n  list-style: none;\n  padding-left: 0;\n  margin: 0; }\n\ninput, button {\n  outline-width: 0; }\n\n* {\n  box-sizing: border-box; }\n"; });
define('text!views/chat.css', ['module'], function(module) { module.exports = ".chat-component {\n  height: 100vh;\n  background: linear-gradient(135DEG, #4080bf, #6a40bf);\n  padding-top: 10px;\n  display: flex;\n  justify-content: center;\n  flex-direction: column;\n  align-items: center; }\n  .chat-component h1 {\n    font-size: 1.3em;\n    background: #333;\n    font-weight: normal;\n    color: white;\n    padding: 10px;\n    width: 100%;\n    max-width: 1000px; }\n    @media screen and (min-width: 1400px) {\n      .chat-component h1 {\n        max-width: 1400px; } }\n  .chat-component section {\n    height: 80vh;\n    width: 100%;\n    max-width: 1000px;\n    margin: 0 auto;\n    display: flex;\n    flex-flow: row wrap; }\n    @media screen and (min-width: 1400px) {\n      .chat-component section {\n        max-width: 1400px; } }\n  .chat-component main {\n    font-size: 1.2em;\n    flex-grow: 1;\n    float: left;\n    height: 100%;\n    display: flex;\n    flex-flow: column; }\n    .chat-component main .chatbox {\n      padding: 15px;\n      font-size: 0.9em;\n      height: 100%;\n      overflow-y: scroll;\n      background: #eee;\n      border-left: solid #333 1px; }\n      .chat-component main .chatbox p {\n        margin: 0 0 5px; }\n    .chat-component main form {\n      background-color: #333;\n      margin-top: auto;\n      border-left: solid #333 1px;\n      border-bottom: solid #333 1px; }\n      .chat-component main form input {\n        font-size: 1em; }\n        .chat-component main form input[type=\"submit\"] {\n          border-color: transparent;\n          background: #79b5d2;\n          color: white;\n          width: 10%;\n          cursor: pointer; }\n          .chat-component main form input[type=\"submit\"]:hover {\n            filter: contrast(140%) brightness(120%); }\n        .chat-component main form input[type='text'] {\n          border-right: none;\n          width: 90%; }\n  .chat-component aside {\n    width: 20%;\n    float: right;\n    background-color: #333;\n    color: white;\n    height: 100%;\n    overflow: hidden;\n    padding: 10px; }\n    .chat-component aside h2 {\n      font-size: 1.1em; }\n    .chat-component aside ul {\n      width: calc(100% + 27px);\n      height: 100%;\n      overflow-y: scroll; }\n      .chat-component aside ul li {\n        cursor: pointer; }\n  .chat-component .tabs-container ul {\n    display: flex;\n    flex-direction: row;\n    width: 100%; }\n    .chat-component .tabs-container ul li {\n      cursor: pointer;\n      padding: 5px;\n      background: #4080bf;\n      color: white;\n      border: solid 1px #333; }\n      .chat-component .tabs-container ul li.active {\n        background: #eee;\n        color: #333;\n        border-bottom-color: transparent; }\n      .chat-component .tabs-container ul li.new-post {\n        animation: blink 2s linear infinite; }\n      .chat-component .tabs-container ul li span {\n        font-size: 0.7em;\n        background: #bf4055;\n        padding: 3px 5px;\n        border: solid 1px #eee;\n        border-radius: 4px; }\n\n@keyframes blink {\n  from, 50% {\n    background: orange; }\n  51%, to {\n    background: #4080bf; } }\n"; });
define('text!views/login.css', ['module'], function(module) { module.exports = ".login-component {\n  background: linear-gradient(135DEG, #4080bf, #6a40bf); }\n  .login-component main {\n    height: 100vh;\n    display: flex;\n    justify-content: center;\n    align-items: center;\n    flex-flow: column wrap; }\n    .login-component main h1 {\n      color: white;\n      text-align: center; }\n    .login-component main input {\n      margin-bottom: 15px;\n      font-size: 1.1em; }\n      .login-component main input[type=\"submit\"] {\n        background: #333;\n        color: white;\n        padding: 5px 15px;\n        border: none;\n        border-radius: 10px;\n        cursor: pointer; }\n      @media screen and (max-width: 768px) {\n        .login-component main input {\n          width: 100%;\n          border-radius: 10px; } }\n"; });
define('text!sass-vars.css', ['module'], function(module) { module.exports = ""; });
define('text!sass-utils.css', ['module'], function(module) { module.exports = ""; });
//# sourceMappingURL=app-bundle.js.map