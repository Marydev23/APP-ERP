from exceptions.api_exception import BadRequest, NotFound
from models.funcionario import Funcionario
from extensions import db


class FuncionarioService:

    @staticmethod
    def registrar(dados, empresa_id):

        if not dados.get("nome"):
            raise BadRequest("Nome é obrigatório")

        funcionario = Funcionario(
            empresa_id=empresa_id,
            nome=dados.get("nome"),
            cargo=dados.get("cargo"),
            endereco=dados.get("endereco"),
            telefone=dados.get("telefone"),
            valor_salario=dados.get("valor_salario"),
            data_admissao=dados.get("data_admissao"),
            data_demissao=dados.get("data_demissao"),
            status=dados.get("status", "ATIVO")
        )

        db.session.add(funcionario)
        db.session.commit()

        return funcionario

    @staticmethod
    def listar(empresa_id):

        funcionarios = Funcionario.query.filter_by(
            empresa_id=empresa_id,
            deletado_em=None
        ).all()

        return funcionarios

    @staticmethod
    def buscar_por_id(funcionario_id, empresa_id):

        funcionario = Funcionario.query.filter_by(
            id=funcionario_id,
            empresa_id=empresa_id,
            deletado_em=None
        ).first()

        if not funcionario:
            raise NotFound("Funcionário não encontrado")

        return funcionario

    @staticmethod
    def atualizar(funcionario_id, dados, empresa_id):

        funcionario = FuncionarioService.buscar_por_id(
            funcionario_id,
            empresa_id
        )

        if "nome" in dados:
            if not dados["nome"]:
                raise BadRequest("Nome é obrigatório")

            funcionario.nome = dados["nome"]

        if "cargo" in dados:
            funcionario.cargo = dados["cargo"]

        if "endereco" in dados:
            funcionario.endereco = dados["endereco"]

        if "telefone" in dados:
            funcionario.telefone = dados["telefone"]

        if "valor_salario" in dados:
            funcionario.valor_salario = dados["valor_salario"]

        if "data_admissao" in dados:
            funcionario.data_admissao = dados["data_admissao"]

        if "data_demissao" in dados:
            funcionario.data_demissao = dados["data_demissao"]

        if "status" in dados:
            funcionario.status = dados["status"]

        db.session.commit()

        return funcionario

    @staticmethod
    def excluir(funcionario_id, empresa_id):

        funcionario = FuncionarioService.buscar_por_id(
            funcionario_id,
            empresa_id
        )

        funcionario.deletado_em = db.func.now()

        db.session.commit()

        return funcionario