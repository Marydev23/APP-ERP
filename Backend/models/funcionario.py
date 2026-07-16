from datetime import datetime
from extensions import db


class Funcionario(db.Model):
    __tablename__ = "funcionarios"

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
        db.String(150),
        nullable=False
    )

    cargo = db.Column(
        db.String(100)
    )

    endereco = db.Column(
        db.String(255)
    )

    telefone = db.Column(
        db.String(20)
    )

    valor_salario = db.Column(
        db.Numeric(10, 2)
    )

    data_admissao = db.Column(
        db.Date
    )

    data_demissao = db.Column(
        db.Date
    )

    status = db.Column(
        db.String(30),
        default="ATIVO"
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
        back_populates="funcionarios"
    )
    def __repr__(self):
        return f"<Funcionario {self.nome}>"