from flask import Flask

from flask_cors import CORS

from config import Config

from extensions import db, migrate, jwt

from exceptions.handlers import register_error_handlers


# ==========================================================
# ROTAS
# ==========================================================

from routes.auth import auth_bp
from routes.usuario import usuario
from routes.empresa import empresa_bp
from routes.cliente import cliente
from routes.categoria import categoria
from routes.produto import produto

from routes.item_venda import item_venda_bp
from routes.orcamento import orcamento_bp

from routes.despesa import despesa_bp
from routes.receita import receita_bp
from routes.venda import venda_bp
from routes.forma_pagamento import forma_pagamento_bp
from routes.taxa_pagamento import taxa_pagamento_bp




app = Flask(__name__)

app.config.from_object(Config)

CORS(app)

db.init_app(app)

migrate.init_app(app, db)

jwt.init_app(app)

register_error_handlers(app)



app.register_blueprint(
    auth_bp,
    url_prefix="/auth"
)

app.register_blueprint(
    usuario,
    url_prefix="/usuario"
)

app.register_blueprint(
    empresa_bp,
    url_prefix="/empresa"
)

app.register_blueprint(
    cliente,
    url_prefix="/cliente"
)

app.register_blueprint(
    categoria,
    url_prefix="/categoria"
)

app.register_blueprint(
    produto,
    url_prefix="/produto"
)

app.register_blueprint(
    item_venda_bp,
    url_prefix="/item_venda"
)
 
app.register_blueprint(
    orcamento_bp,
    url_prefix="/orcamento"
)

app.register_blueprint(
    despesa_bp,
    url_prefix="/despesa"
)

app.register_blueprint(
    receita_bp,
    url_prefix="/receita"
)

app.register_blueprint(
    venda_bp,
    url_prefix="/venda"
)

app.register_blueprint(
    forma_pagamento_bp,
    url_prefix="/forma-pagamento"
)
app.register_blueprint(
    taxa_pagamento_bp,
    url_prefix="/taxa-pagamento"
)




if __name__ == "__main__":
    app.run(debug=True)