const socket = io();
let username = "";
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
const bidenSound = new Audio('/static/biden_sound.mp3');

function askUsername() {
  username = prompt("Enter your username:").trim();
  if (username) {
    socket.emit('join', { username });
  } else {
    askUsername();
  }
}
askUsername();

socket.on('join_error', function(data) {
  alert(data.message);
  askUsername();
});


socket.on('user_list', function(users) {
  // Clean up ghost users from local state
  for (const user of Object.keys(chats)) {
    if (user !== 'Everyone' && user !== username && !users.includes(user)) {
      delete chats[user];
      delete unread[user];
    }
  }

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


// Get the "Send Joe" button
const sendButton = document.getElementById('sendJoe');

// Cooldown state flag and duration (in seconds)
let cooldown = false;
let cooldownDuration = 2;

// On click handler for the button
sendButton.onclick = function () {
  // Prevent sending if we're in cooldown
  if (cooldown) return;

  // Emit the "Joe" message to the server
  socket.emit('send_message', { to: currentChat });

  // Begin cooldown
  cooldown = true;
  let remaining = cooldownDuration;

  // Disable button and show countdown text
  sendButton.disabled = true;
  sendButton.textContent = `Wait ${remaining}s`;

  // Start countdown interval (updates text every second)
  const interval = setInterval(() => {
    remaining -= 1;

    // If time remains, update the text
    if (remaining > 0) {
      sendButton.textContent = `Wait ${remaining}s`;
    } else {
      // Cooldown complete: re-enable button and restore label
      clearInterval(interval);
      cooldown = false;
      sendButton.disabled = false;
      sendButton.textContent = 'Send Joe';
    }
  }, 1000); // runs every 1 second
};




socket.on('new_message', data => {
  const chatId = data.to === 'Everyone' ? 'Everyone' :
                 data.from === username ? data.to : data.from;

  if (!chats[chatId]) chats[chatId] = [];
  chats[chatId].push(data);

  const isSystemMessage = data.from === 'System';
  const isCurrent = chatId === currentChat;
  const isFromMe = data.from === username;

  // Notify only if private and not current view
  if (!isSystemMessage && !isCurrent && !isFromMe) {
    unread[chatId] = (unread[chatId] || 0) + 1;

    // Show notification
    showNotification(`${data.from} sent you a ${data.message}`);

    // Choose sound based on message type
    const sound = data.message === 'Joe Biden' ? bidenSound : joeSound;
    sound.play().catch(() => {
      console.log("Sound playback blocked without user interaction");
    });
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