(function () {
  const app = document.querySelector("body");
  const socket = io();

  let uname;

  // Обработчик нажатия Enter при вводе никнейма
  document.getElementById("username").addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      event.preventDefault();
      AuthUser();
    }
  });

  // Обработчик нажатий Enter для отправки сообщения.
  // При нажатии Shift + Enter перенос строки
  document.getElementById("message-input").addEventListener("keydown", function (event) {
    if (event.shiftKey && event.key === "Enter") {
      this.value += "\n";
      event.preventDefault();
    } else if (event.key === "Enter") {
      event.preventDefault();
      sendMessage();
    }
  });

  // Функция отправки сообщения
  function sendMessage() {
    let message = app.querySelector(".chat_input-box #message-input").value;
    if (message.trim().length === 0) {
      return;
    }
    renderMessage("me", {
      username: uname,
      text: message,
    });
    socket.emit("chat", {
      username: uname,
      text: message,
    });
    app.querySelector(".chat_input-box #message-input").value = "";
  }

  function AuthUser() {
    // Вход пользователя по никнейму
    let username = app.querySelector(".join-screen #username").value;
    if (username.length === 0) {
      return;
    }
    socket.emit("login", username);
    uname = username;

    // Убираем размытие и окно
    app.querySelector(".container").classList.remove("blur-element");
    app.querySelector(".join-screen").style.display = "none";
  }

  // Обработка нажатия на кнопку JOIN
  app.querySelector(".join-screen #join-chat-btn").addEventListener("click", function () {
    AuthUser();
  });

  // Обработчик нажатия кнопки Отправки сообщения
  app.querySelector(".chat_input-box #send-btn").addEventListener("click", function () {
    sendMessage();
  });

  // Обрабочик нажатия кнопки Выход
  app.querySelector(".header #logout").addEventListener("click", function () {
    socket.emit("logout", uname);
    // window.location.href = window.location.href;
    window.location.reload();
  });

  socket.on("update", function (update) {
    renderMessage("update", update);
  });

  socket.on("chat", function (message) {
    renderMessage("other", message);
  });

  // печатать
  message.bind("keypress", (e) => {
    let keycode = e.keyCode ? e.keyCode : e.which;
    if (keycode != "13") {
      socket.emit("typing");
    }
  });

  //Listen on typing
  socket.on("typing", (data) => {
    feedback.html("<p><i>" + data.username + " is typing a message..." + "</i></p>");
  });

  socket.on('typing', data => {
    socket.broadcast.emit('typing',{username: socket.username})
})

  // Эмоджи
  let EmojiConvertor = require("emoji-js");

  let emoji = new EmojiConvertor();

  console.log(emoji.replace_colons("Hello :smile:"));

  // Создание сообщения
  function renderMessage(type, message) {
    let messageContainer = app.querySelector(".container .chat-box");
    // Сообщения от нашего лица
    if (type === "me") {
      let el = document.createElement("div");
      el.setAttribute("class", "message me-message");
      // Строчка
      // style="background: ${`hsl(${Math.random()*360},55%,85%)`}"
      // делает сообщения разноцветными :)
      el.innerHTML = `
                <div style="background: ${`hsl(143, 48%, 86%)`}">
                    <div class="name">You</div>
                    <div class="text">${message.text}</div>
                </div>
            `;
      messageContainer.appendChild(el);
    }
    // Сообщения от других лиц
    else if (type === "other") {
      let el = document.createElement("div");
      el.setAttribute("class", "message other-message");
      // Разноцветные сообщения так же и при входящих
      el.innerHTML = `
                <div style="background: ${`hsl(9,95%,90%)`}">
                    <div class="name">${message.username}</div>
                    <div class="text">${message.text}</div>
                </div>
            `;
      messageContainer.appendChild(el);
    }
    // Сообщения при входе новых участников
    else if (type === "update") {
      let el = document.createElement("div");
      el.setAttribute("class", "update");
      el.innerText = message;
      messageContainer.appendChild(el);
    }
    messageContainer.scrollTop = messageContainer.scrollHeight - messageContainer.clientHeight;
  }
})();
