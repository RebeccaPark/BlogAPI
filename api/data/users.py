import bcrypt

from api import api
from api import db

def get():
    users = []
    cursor = db.cursor()
    cursor.execute("SELECT * FROM Users;")
    for (user_id, username, password, nickname, picture, user_level, delete,
         created, updated) in cursor.fetchall():
        users.append(
            {
                "id": user_id,
                "username": username,
                "password": password,
                "nickname": nickname,
                "picture": picture,
                "user_level": user_level,
                "delete": delete,
                "created": created,
                "updated": updated,
            }
        )
        cursor.close()
    return users

def create(account_dictionary):
    cursor = db.cursor()
    #hashed_password = bcrypt.hashpw(account_dictionary['password'].encode(), bcrypt.gensalt())
    cursor.execute("INSERT INTO Users (username, password, nickname, user_level) VALUES (%s, %s, %s, %s);",
                   (account_dictionary['username'], bcrypt.hashpw(account_dictionary['password'].encode(), bcrypt.gensalt()), 'nickname', 'Admin'))
    last_id = cursor.lastrowid
    db.commit()
    cursor.execute("SELECT * FROM Users WHERE id=%s", (last_id,))
    account_info = cursor.fetchone()
    cursor.close()
    account = {
        "id" : account_info[0],
        "username" : account_info[1],
        "password" : account_info[2],
        "nickname" : account_info[3],
        "picture" : account_info[4],
        "user_level" : account_info[5],
        "deleted" : account_info[6],
        "created" : account_info[7],
        "updated" : account_info[8]
    }
    print('account_info:', account_info)
    print('account: ', account)
    return account


def get_one_user(username):
    user_information = {}
    cursor = db.cursor()
    cursor.execute("SELECT * FROM Users WHERE username=%s;", (username,))
    result = cursor.fetchone()
    user_information = {
        "id": result[0],
        "username": result[1],
        "password": result[2],
        "nickname": result[3],
        "picture": result[4],
        "user_level": result[5],
        "delete": result[6],
        "created": result[7],
        "updated": result[8]
    }
    cursor.close()
    return user_information

def get_user_id(username):
    cursor = db.cursor()
    cursor.execute("SELECT id FROM Users WHERE username=%s;", (username,))
    user_id = cursor.fetchone()[0]
    cursor.close()
    return user_id

def validate(username, password):
    cursor = db.cursor()
    cursor.execute("SELECT password FROM Users WHERE username=%s;", (username,))
    result = cursor.fetchone()
    cursor.close()

    if result:
        fetched_password = result[0]
    else:
        return False

    return bcrypt.checkpw(password.encode('utf-8'), fetched_password)
