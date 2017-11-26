import json
import datetime

from flask import make_response, request, redirect

from api.data import sessions

def jsonify(obj):
    def jsonify_dict(dictionary):
        for key, val in dictionary.items():
            if isinstance(val, bytes):
                dictionary[key] = val.decode()
            elif isinstance(val, datetime.datetime):
                dictionary[key] = val.isoformat()
        return dictionary

    if isinstance(obj, dict):
        obj = jsonify_dict(obj)
    elif isinstance(obj, list):
        obj = list(map(jsonify_dict, obj))
    return json.dumps(obj)

def get_session():
    session_id = request.cookies.get('session_id')
    if not session_id:
            return False

    session = sessions.get(session_id)

    if not session or session['expired']:
        print('Session expired')
        return False

    print('Session is alive and well')
    print('Get session: ', session)
    return session

def set_session(received_response, session_id):
    print('session_id in set_session', session_id)
    response = make_response(received_response)
    response.set_cookie('session_id', str(session_id).encode())
    return response

# session, redirect = require_session()
# if redirecT:
#   return redirect
# blah blah blah
def require_session():
    session = get_session()
    if session:
        print('Session exists')
        return session, None
    print('Session doesn not exist')
    return None, redirect('/admin/login')
