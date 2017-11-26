from api import db

def get():
    posts = []
    cursor = db.cursor()
    cursor.execute("SELECT * FROM Posts;")
    for post_id, author_id, title, content, deleted, created, updated in cursor.fetchall():
        posts.append({
            "id": post_id,
            "author_id": author_id,
            "title": title,
            "content": content,
            "deleted": deleted,
            "created": created,
            "updated": updated,
        })
    cursor.close()
    return posts

def get_one_post(post_id):
    cursor = db.cursor()
    cursor.execute("SELECT * FROM Posts WHERE id=%s;", (post_id,))
    post_id, author_id, title, content, deleted, created, updated = cursor.fetchone()
    cursor.close()
    return {
        "id": post_id,
        "author_id": author_id,
        "title": title,
        "content": content,
        "deleted": deleted,
        "created": created,
        "updated": updated,
    }

def create(user_id, post_dictionary):
    post = {}
    cursor = db.cursor()

    if not post_dictionary['title'] or not post_dictionary['content']:
        return
    cursor.execute("INSERT INTO Posts (author_id, title, content) Values(%s, %s, %s)",
                   (user_id, post_dictionary['title'], post_dictionary['content']))
    db.commit()
    last_id = cursor.lastrowid
    cursor.execute("SELECT * FROM Posts WHERE id=%s", (last_id,))
    post_info = cursor.fetchone()
    post = {
        "id": post_info[0],
        "author_id": post_info[1],
        "title": post_info[2],
        "content": post_info[3],
        "created": post_info[4],
        "updated": post_info[5]
    }
    cursor.close()
    return post

def update(post_id, title, content):
    response_message = ""
    with db.cursor() as cursor:
        cursor.execute("SELECT * FROM Posts WHERE id=%s;", (post_id,))
        if cursor.fetchone():
            cursor.execute("UPDATE Posts SET title=%s, content=%s WHERE id=%s;", (title, content,))
            response_message = "Posts id %s is updated" % post_id
        else:
            response_message = "Posts id %s does not exist" % post_id
    cursor.close()
    return response_message

def delete(post_id):
    response_message = ""
    cursor = db.cursor()
    cursor.execute("DELETE FROM Posts WHERE id=%s", (post_id,))
    cursor.close()
    return response_message

def get_one_comment(comment_id):
    cursor = db.cursor()
    cursor.execute("SELECT * FROM Comment WHERE id=%s", (comment_id,))
    comment_info = cursor.fetchone()
    return comment_info
