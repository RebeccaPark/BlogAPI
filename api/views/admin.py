from flask import request, render_template, redirect

from api import api
from api.data import sessions, users
from api.views import utility


@api.route('/admin')
@api.route('/admin/<path:path>')
def admin(path=None):
    return render_template('admin.html')


@api.route('/admin/login', methods=['POST'])
def login_post():
    username = request.get_json().get('username')
    password = request.get_json().get('password')

    errors = []

    if not username:
        errors.append({'field': 'username', 'message': 'Must supply username'})

    if not password:
        errors.append({'field': 'password', 'message': 'Must supply password'})

    if errors:
        return utility.jsonify({'errors': errors})

    if not users.validate(username, password):
        return utility.jsonify({
            'errors': [
                {'field': '', 'message': 'Username or password is invalid'}
            ]
        })

    session_id = sessions.create(username)
    print('session_id received on admin.py', session_id)
    return utility.set_session(utility.jsonify({ 'errors': [] }), session_id)

@api.route('/admin/logout')
def logout():
    return utility.set_session(redirect('/admin/login'), None)
