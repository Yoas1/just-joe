from flask import Flask, render_template, request
from flask_socketio import SocketIO, emit, join_room

app = Flask(__name__)
socketio = SocketIO(app)

users = {}


@app.route('/')
def index():
    return render_template('chat.html')


@socketio.on('join')
def handle_join(data):
    username = data['username']
    users[request.sid] = username
    emit('user_list', list(users.values()), broadcast=True)

    # send system message (without triggering sound)
    emit('new_message', {
        'from': 'System',
        'to': 'Everyone',
        'message': f"{username} has joined the chat"
    }, broadcast=True)


@socketio.on('send_message')
def handle_message(data):
    sender = users.get(request.sid)
    message_data = {
        'from': sender,
        'to': data['to'],
        'message': 'Joe'
    }

    if data['to'] == 'Everyone':
        emit('new_message', message_data, broadcast=True)
    else:
        for sid, name in users.items():
            if name == data['to'] or name == sender:
                emit('new_message', message_data, room=sid)

@socketio.on('disconnect')
def handle_disconnect():
    username = users.pop(request.sid, None)
    if username:
        emit('user_list', list(users.values()), broadcast=True)
        emit('new_message', {
            'from': 'System',
            'to': 'Everyone',
            'message': f"{username} has left the chat"
        }, broadcast=True)

if __name__ == '__main__':
    socketio.run(app, debug=True)
