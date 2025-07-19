const socket = io();
let username = prompt("Enter your username:");
let currentChat = 'Everyone';
let chats = { 'Everyone': [] };
let unread = {};

// Request browser notification permission
if ('Notification' in window) {
  if (Notification.permission === 'default') {
    Notification.requestPermission();
  }
}

// Load "Joe" sound
const joeSound = new Audio('/static/joe_sound.mp3');

socket.emit('join', { username });

socket.on('user_list', function(users) {
  const list = document.getElementById('userList');
  list.innerHTML = '';

  function createListItem(name) {
    const li = document.createElement('li');
    li.textContent = name;
    if (unread[name] > 0) li.textContent += ' 🔔';
    li.onclick = () => switchChat(name);
    if (name === currentChat) li.classList.add('active');
    list.appendChild(li);
  }

  createListItem('Everyone');

  users.forEach(u => {
    if (u !== username) {
      if (!chats[u]) chats[u] = [];
      if (!unread[u]) unread[u] = 0;
      createListItem(u);
    }
  });
});

document.getElementById('sendJoe').onclick = function() {
  socket.emit('send_message', { to: currentChat });
};

socket.on('new_message', data => {
  const chatId = data.to === 'Everyone' ? 'Everyone' :
                 data.from === username ? data.to : data.from;

  if (!chats[chatId]) chats[chatId] = [];
  chats[chatId].push(data);

  // Play sound only if the message is for a different chat
  if (chatId !== currentChat && data.from !== username) {
    unread[chatId] = (unread[chatId] || 0) + 1;

    try {
      joeSound.play();
    } catch(e) {
      console.log('Could not autoplay sound – interaction required');
    }

    showNotification(`${data.from} sent you a Joe`);
  }

  renderMessages();
  renderUserList();
});

function renderMessages() {
  const msgs = chats[currentChat] || [];
  const container = document.getElementById('messages');
  container.innerHTML = '';

  msgs.forEach(msg => {
    if (msg.from === 'System') {
      const sys = document.createElement('div');
      sys.classList.add('message', 'system');
      sys.textContent = msg.message;
      container.appendChild(sys);
      return;
    }

    const block = document.createElement('div');
    block.classList.add('message-block');
    block.style.alignSelf = msg.from === username ? 'flex-end' : 'flex-start';

    const name = document.createElement('div');
    name.classList.add('sender');
    name.textContent = msg.from;

    const bubble = document.createElement('div');
    bubble.classList.add('message');
    bubble.classList.add(msg.from === username ? 'self' : 'other');
    bubble.textContent = msg.message;

    block.appendChild(name);
    block.appendChild(bubble);
    container.appendChild(block);
  });

  container.scrollTop = container.scrollHeight;
}

function renderUserList() {
  const list = document.getElementById('userList');
  list.innerHTML = '';

  function createListItem(name) {
    const li = document.createElement('li');
    li.textContent = name;
    if (unread[name] > 0) li.textContent += ' 🔔';
    li.onclick = () => switchChat(name);
    if (name === currentChat) li.classList.add('active');
    list.appendChild(li);
  }

  createListItem('Everyone');
  Object.keys(chats).forEach(name => {
    if (name !== username && name !== 'Everyone') createListItem(name);
  });
}

function switchChat(name) {
  currentChat = name;
  unread[name] = 0;
  document.getElementById('chatTitle').textContent = name;
  renderMessages();
  renderUserList();
}

function showNotification(msg) {
  // Show toast on screen
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.style.display = 'block';
  toast.style.opacity = '1';

  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => { toast.style.display = 'none'; }, 500);
  }, 3000);

  // Show system notification
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('Just Joe', { body: msg, icon: '/static/joe_icon.png' });
  }
}
