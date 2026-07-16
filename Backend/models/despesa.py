from datetime import datetime
from extensions import db


class Despesa(db.Model):
    __tablename__ = "despesas"

    id = db.Column(db.Integer, primary_key=True)

    empresa_id = db.Column(
        db.Integer,
        db.ForeignKey("empresas.id"),
        nullable=False,
        index=True
    )

    categoria_id = db.Column(
        db.Integer,
        db.ForeignKey("categorias.id"),
        nullable=True,
        index=True
    )

    nome = db.Column(
        db.String(150),
        nullable=False
    )

    descricao = db.Column(db.Text)

    valor = db.Column(
        db.Numeric(10, 2),
        nullable=False
    )

    data_vencimento = db.Column(
        db.Date,
        nullable=False
    )

    data_pagamento = db.Column(db.Date)

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
        back_populates="despesas"
    )

    categoria = db.relationship(
        "Categoria",
        back_populates="despesas"
    )
    def __repr__(self):
        return f"<Despesa {self.nome}>"