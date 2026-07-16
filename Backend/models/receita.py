from datetime import datetime
from extensions import db


class Receita(db.Model):
    __tablename__ = "receitas"

    id = db.Column(db.Integer, primary_key=True)

    empresa_id = db.Column(
        db.Integer,
        db.ForeignKey("empresas.id"),
        nullable=False,
        index=True
    )

    cliente_id = db.Column(
        db.Integer,
        db.ForeignKey("clientes.id"),
        nullable=True,
        index=True
    )

    categoria_id = db.Column(
        db.Integer,
        db.ForeignKey("categorias.id"),
        nullable=True,
        index=True
    )

    data = db.Column(
        db.Date,
        nullable=False
    )

    data_recebimento = db.Column(db.Date)

    descricao = db.Column(db.Text)

    valor = db.Column(
        db.Numeric(10, 2),
        nullable=False
    )

    forma_pagamento = db.Column(db.String(50))

    desconto = db.Column(
        db.Numeric(10, 2),
        default=0
    )

    valor_total = db.Column(
        db.Numeric(10, 2),
        nullable=False
    )

    status = db.Column(
        db.String(30),
        default="PENDENTE"
    )

    criado_em = db.Column(
        db.DateTime,
        default=datetime.utcnow
    )

    atualizado_em = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )
    deletado_em = db.Column(
    db.DateTime,
    nullable=True
    )

    empresa = db.relationship(
        "Empresa",
        back_populates="receitas"
    )

    cliente = db.relationship(
        "Cliente",
        back_populates="receitas"
    )

    categoria = db.relationship(
        "Categoria",
        back_populates="receitas"
    )
    def __repr__(self):
         return f"<Receita {self.id}>"