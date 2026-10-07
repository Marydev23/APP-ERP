
from datetime import datetime

from extensions import db


class TaxaPagamento(db.Model):

    __tablename__ = "taxas_pagamento"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    forma_pagamento_id = db.Column(
        db.Integer,
        db.ForeignKey("formas_pagamento.id"),
        nullable=False,
        index=True
    )

    parcelas = db.Column(
        db.Integer,
        nullable=False,
        default=1
    )

    percentual = db.Column(
        db.Numeric(5, 2),
        nullable=False,
        default=0
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

    forma_pagamento = db.relationship(
        "FormaPagamento",
        back_populates="taxas"
    )

    __table_args__ = (
        db.UniqueConstraint(
            "forma_pagamento_id",
            "parcelas",
            name="uq_taxa_forma_pagamento_parcelas"
        ),
    )

    def __repr__(self):
        return f"<TaxaPagamento {self.percentual}%>"
