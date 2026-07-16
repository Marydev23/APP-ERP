from flask import Flask
from flask_cors import CORS

from config import Config
from extensions import db, migrate

app = Flask(__name__)
app.config.from_object(Config)

CORS(app)

db.init_app(app)
migrate.init_app(app, db)

# Carrega todos os models
import models


@app.route("/")
def home():
    return {
        "status": "online",
        "mensagem": "API ERP funcionando!"
    }


if __name__ == "__main__":
    app.run(debug=True)