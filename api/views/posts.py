from flask import request

from api import api
from api.data import posts, comments, sessions
from api.views.utility import jsonify, require_session


@api.route('/posts', methods=['GET'])
def posts_handler():
    return jsonify(posts.get())

@api.route('/posts', methods=['POST'])
def posts_create_handler():
    session, redirect = require_session()
    if redirect:
        return redirect
    data = request.get_json()
    user_id = sessions.get_user_id(session['id'])
    post = posts.create(user_id, data)
    return jsonify(post)


@api.route('/posts/<post_id>', methods=['GET'])
def posts_get_one(post_id):
    return jsonify(posts.get_one_post(post_id))

@api.route('/posts/<post_id>', methods=['PUT'])
def posts_update_handler(post_id):
    _, redirect = require_session()
    if redirect:
        return redirect
    data = request.get_json()
    posts.update(post_id, data.title, data.content)
    return

@api.route('/posts/<post_id>', methods=['DELETE'])
def posts_delete_handler(post_id):
    _, redirect = require_session()
    if redirect:
        return redirect
    if posts.get_one_post(post_id):
        posts.delete(post_id)
        return jsonify({"errors": []})
    return jsonify({"errors": ["Post does not exist."]})


@api.route('/posts/<post_id>/comments', methods=['POST'])
def write_comment_handler(post_id):
    _, redirect = require_session()
    if redirect:
        return redirect
    content = request.get_json()
    result = comments.create(post_id, 1, content)
    return jsonify(result)


@api.route('/posts/<post_id>/comments', methods=['GET'])
def get_comment_handler(post_id):
    all_comments = comments.get(post_id)
    return jsonify(all_comments)


@api.route('/posts/<post_id>/comments/<comment_id>', methods=['DELETE'])
def delete_comment_handler(post_id, comment_id): # pylint: disable=unused-argument
    _, redirect = require_session()
    if redirect:
        return redirect
    if comments.get_one(comment_id):
        comments.delete(comment_id)
        return #jsonify({ "errors": response_message })
    return jsonify({"errors":["Comment does not exist."]})
