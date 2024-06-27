from flask_pymongo import PyMongo

db = PyMongo()

def init_app(app):
    db.init_app(app)
