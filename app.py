from flask import Flask, render_template, request
from flask_socketio import SocketIO, emit
import random

app = Flask(__name__)
socketio = SocketIO(app)

# Store connected users { sid: username }
users = {}

biden_countdown = 4


@app.route('/')
def index():
    return render_template('chat.html')


@socketio.on('join')
def handle_join(data):
    username = data['username'].strip()

    if not username:
        emit('join_error', {'message': 'Username cannot be empty'})
        return

    if username in users.values():
        emit('join_error', {'message': 'Username already taken'})
        return

    users[request.sid] = username
    emit('user_list', list(users.values()), broadcast=True)

    emit('new_message', {
        'from': 'System',
        'to': 'Everyone',
        'message': f"{username} has joined the chat"
    }, broadcast=True)


@socketio.on('disconnect')
def handle_disconnect():
    username = users.pop(request.sid, None)
    if username:
        emit('user_list', list(users.values()), broadcast=True)
        emit('new_message', {
            'from': 'System',
            'to': 'Everyone',
            'message': f"{username} left the chat"
        }, broadcast=True)


@socketio.on('send_message')
def handle_send(data):
    global biden_countdown
    to = data['to']
    sender = users.get(request.sid, 'Unknown')

    if biden_countdown == 0:
        message = 'Joe Biden'
        biden_countdown = random.randint(1, 10)
    else:
        message = 'Joe'
        biden_countdown = biden_countdown - 1

    msg = {
        'from': sender,
        'to': to,
        'message': message
    }

    if to == 'Everyone':
        # Send to all connected users
        for sid in users:
            emit('new_message', msg, room=sid)
    else:
        # Private message: send only to sender and receiver
        for sid, name in users.items():
            if name == to or name == sender:
                emit('new_message', msg, room=sid)


if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000)