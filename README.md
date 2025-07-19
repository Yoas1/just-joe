<p align="center">
  <img src="static/joe_icon.png" alt="Just Joe Logo" width="120">
</p>

# 🟢 Just Joe — The One-Word Chat App

**Just Joe** is a playful, minimalist real-time chat application where users can send only one word to each other: **"Joe"** 😄.  
Despite its simplicity, the app supports private chats, desktop alerts, mobile-friendly layout, and visual indicators for unread messages — all using Python and WebSockets.

---

## 🚀 Features

- 💬 **Send "Joe"** to everyone or to specific users privately  
- 🔒 **Private conversations** in separate chat windows  
- 🟢 **Online users list** in the sidebar  
- 🔔 **Unread message indicators** next to users   
- 📣 **Desktop toast + sound** only when someone sends you "Joe" in a chat you're not viewing  
- 📱 **Responsive design** for mobile and desktop  
- 💻 **Modern UI** with blue/gray theme

---

## 🛠️ Tech Stack

- **Flask** – Python web framework  
- **Flask-SocketIO** – Real-time communication  
- **HTML + CSS + JavaScript** – Frontend  
- **Socket.IO (JS)** – WebSocket client

---

## 🖼️ Interface Overview

- Sidebar showing all active users  
- One shared "Everyone" chat + separate windows for private chats  
- Green chat bubbles = messages you sent  
- Blue chat bubbles = messages you received  
- Desktop toast & sound only when a "Joe" is received in another tab

---

## 📦 Installation & Run

1. **Clone the repository**  
   ```bash
   git clone https://github.com/your-username/just-joe.git
   cd just-joe
   ```

2. **Install Python dependencies**  
   ```bash
   pip install flask flask-socketio
   ```

3. **Start the app**  
   ```bash
   flask run --debug -h 0.0.0.0
   ```

4. **Open your browser**  
   Navigate to: [http://localhost:5000](http://localhost:5000)

You can open in multiple tabs or devices to simulate multiple users.

---

## 🐳 Run with Docker

You can easily run this app using Docker or Docker Compose.

### ▶️ Using Docker

```bash
docker run -p 5000:5000 yoas1/just-joe:v0.0.1
```

### ▶️ Using Docker Compose

Create a `compose.yml` file:

```yaml
version: '3'
services:
  just-joe:
    container_name: just-joe
    image: yoas1/just-joe:v0.0.1
    ports:
      - "5000:5000"
```

Then run:

```bash
docker-compose up -d
```
The app will be available at [http://localhost:5000](http://localhost:5000)

## 📁 Project Structure

```
just-joe/
├── app.py                  # Flask server logic
├── templates/
│   └── chat.html           # Main HTML page
├── static/
│   ├── style.css           # Styling and layout
│   ├── chat.js             # Client-side logic
│   ├── joe_sound.mp3       # Notification sound
│   └── joe_icon.png        # App icon
```

---

## 🎯 Philosophy

> _What happens when the only thing you're allowed to say is "Joe"?_

**Just Joe** was built as a humorous experiment that evolved into a lightweight and expressive messaging platform. Surprisingly, it still manages to convey meaning, timing, and interaction — all with a single word.

---

## 📜 License

MIT License  
Feel free to use, modify, and build upon it.
