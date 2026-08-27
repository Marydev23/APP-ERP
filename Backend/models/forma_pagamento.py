from datetime import datetime

from extensions import db


class FormaPagamento(db.Model):

    __tablename__ = "formas_pagamento"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    empresa_id = db.Column(
        db.Integer,
        db.ForeignKey("empresas.id"),
        nullable=False,
        index=True
    )

    nome = db.Column(
        db.String(100),
        nullable=False
    )

    tipo = db.Column(
        db.String(30),
        nullable=False
    )

    ativo = db.Column(
        db.Boolean,
        default=True
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

    empresa = db.relationship(
        "Empresa",
        back_populates="formas_pagamento"
    )

    taxas = db.relationship(
        "TaxaPagamento",
        back_populates="forma_pagamento",
        cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f"<FormaPagamento {self.nome}>"