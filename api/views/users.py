from flask import request, redirect

from api import api
from api.data import users
from api.views.utility import jsonify

@api.route('/account/create', methods=['POST'])
def sign_up():
    data = request.get_json()
    create_account = users.create(data)
    return jsonify(create_account)

@api.route('/users', methods=['GET'])
def users_get():
    result = users.get()
    return jsonify(result)
