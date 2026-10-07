from datetime import datetime

from exceptions.api_exception import BadRequest, NotFound

from models.cliente import Cliente

from extensions import db


class ClienteService:

 

    @staticmethod
    def registrar(dados, empresa_id):

        if not dados.get("nome"):
            raise BadRequest("Nome é obrigatório.")

        if not dados.get("cpf_cnpj"):
            raise BadRequest("CPF/CNPJ é obrigatório.")

        cliente_existente = Cliente.query.filter_by(
            empresa_id=empresa_id,
            cpf_cnpj=dados["cpf_cnpj"],
            deletado_em=None
        ).first()

        if cliente_existente:
            raise BadRequest(
                "CPF/CNPJ já cadastrado."
            )

        cliente = Cliente(
            empresa_id=empresa_id,
            nome=dados["nome"],
            cpf_cnpj=dados["cpf_cnpj"],
            telefone=dados.get("telefone"),
            email=dados.get("email"),
            endereco=dados.get("endereco"),
            cidade=dados.get("cidade"),
            estado=dados.get("estado"),
            cep=dados.get("cep"),
            observacao=dados.get("observacao")
        )

        try:

            db.session.add(cliente)
            db.session.commit()

            return cliente

        except Exception:

            db.session.rollback()

            raise BadRequest(
                "Não foi possível cadastrar o cliente."
            )



    @staticmethod
    def listar(empresa_id):

        clientes = Cliente.query.filter_by(
            empresa_id=empresa_id,
            deletado_em=None
        ).all()

        return clientes



    @staticmethod
    def buscar_ou_criar_por_nome(nome, empresa_id):

        if not nome or not nome.strip():
            return None

        nome = nome.strip()

        cliente = Cliente.query.filter(
            Cliente.empresa_id == empresa_id,
            Cliente.nome.ilike(nome),
            Cliente.deletado_em.is_(None)
        ).first()

        if cliente:
            return cliente

        cliente = Cliente(
            empresa_id=empresa_id,
            nome=nome
        )

        db.session.add(cliente)
        db.session.flush()

        return cliente





    @staticmethod
    def buscar_por_id(cliente_id, empresa_id):

        cliente = Cliente.query.filter_by(
            id=cliente_id,
            empresa_id=empresa_id,
            deletado_em=None
        ).first()

        if not cliente:
            raise NotFound(
                "Cliente não encontrado."
            )

        return cliente



    @staticmethod
    def atualizar(cliente_id, dados, empresa_id):

        cliente = ClienteService.buscar_por_id(
            cliente_id,
            empresa_id
        )

   

        if "cpf_cnpj" in dados:

            cliente_existente = Cliente.query.filter(
                Cliente.id != cliente_id,
                Cliente.empresa_id == empresa_id,
                Cliente.cpf_cnpj == dados["cpf_cnpj"],
                Cliente.deletado_em.is_(None)
            ).first()

            if cliente_existente:
                raise BadRequest(
                    "CPF/CNPJ já cadastrado para outro cliente."
                )

            cliente.cpf_cnpj = dados["cpf_cnpj"]

       

        if "nome" in dados:
            cliente.nome = dados["nome"]

        if "telefone" in dados:
            cliente.telefone = dados["telefone"]

        if "email" in dados:
            cliente.email = dados["email"]

        if "endereco" in dados:
            cliente.endereco = dados["endereco"]

        if "cidade" in dados:
            cliente.cidade = dados["cidade"]

        if "estado" in dados:
            cliente.estado = dados["estado"]

        if "cep" in dados:
            cliente.cep = dados["cep"]

        if "observacao" in dados:
            cliente.observacao = dados["observacao"]

        try:

            db.session.commit()

            return cliente

        except Exception:

            db.session.rollback()

            raise BadRequest(
                "Não foi possível atualizar o cliente."
            )

      
    @staticmethod
    def buscar_ou_criar_por_nome(nome, empresa_id):

        if not nome or not nome.strip():
            return None

        nome = nome.strip()

        cliente = Cliente.query.filter(
            Cliente.empresa_id == empresa_id,
            Cliente.nome.ilike(nome),
            Cliente.deletado_em.is_(None)
        ).first()

        if cliente:
            return cliente

        cliente = Cliente(
            empresa_id=empresa_id,
            nome=nome
        )

        db.session.add(cliente)
        db.session.flush()

        return cliente





    @staticmethod
    def deletar(cliente_id, empresa_id):

        cliente = Cliente.query.filter_by(
            id=cliente_id,
            empresa_id=empresa_id,
            deletado_em=None
        ).first()

        if not cliente:
            raise NotFound(
                "Cliente não encontrado."
            )

        cliente.deletado_em = datetime.utcnow()

        db.session.commit()

        return True