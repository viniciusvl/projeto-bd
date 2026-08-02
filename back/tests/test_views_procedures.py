"""
Testes de integração para Views e Stored Procedures.

Execução:
    cd back
    python -m pytest tests/test_views_procedures.py -v

Pré-requisito: banco 'hospital' acessível com as views e procedures aplicadas.
"""
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

import json
import pytest
from datetime import datetime

from db.connect import executar_query, get_connection
from db.repository import atendimento_repository, relatorio_repository, escala_repository


# ==============================================================================
# Helpers
# ==============================================================================

def _primeiro_id(tabela: str, coluna_pk: str) -> int | None:
    rows = executar_query(f"SELECT {coluna_pk} FROM {tabela} LIMIT 1", fetch=True)
    return rows[0][coluna_pk] if rows else None


# ==============================================================================
# Views
# ==============================================================================

class TestViews:

    def test_pacientes_internados_retorna_lista(self):
        resultado = relatorio_repository.pacientes_internados()
        assert isinstance(resultado, list), "Deve retornar uma lista"
        for row in resultado:
            assert "id_paciente" in row
            assert "nome_paciente" in row
            assert "unidade_internacao" in row
            assert "data_entrada" in row
            # Garante que só traz internações sem data_saida
            # (a view filtra WHERE data_saida IS NULL; se retornou, está internado)

    def test_residentes_sem_supervisor_retorna_lista(self):
        resultado = relatorio_repository.residentes_sem_supervisor()
        assert isinstance(resultado, list)
        for row in resultado:
            assert "id_escala" in row
            assert "nome_residente" in row
            assert "motivo_alerta" in row

    def test_estatisticas_mensais_sem_filtro(self):
        resultado = relatorio_repository.estatisticas_mensais()
        assert isinstance(resultado, list)
        for row in resultado:
            assert "ano" in row
            assert "mes" in row
            assert "nome_unidade" in row
            assert "total_atendimentos" in row

    def test_estatisticas_mensais_com_filtro_ano(self):
        """Com ano válido deve retornar apenas registros daquele ano (ou lista vazia)."""
        resultado = relatorio_repository.estatisticas_mensais(ano=2025)
        assert isinstance(resultado, list)
        for row in resultado:
            assert row["ano"] == 2025

    def test_estatisticas_mensais_com_filtro_ano_mes(self):
        resultado = relatorio_repository.estatisticas_mensais(ano=2025, mes=1)
        assert isinstance(resultado, list)
        for row in resultado:
            assert row["ano"] == 2025
            assert row["mes"] == 1


# ==============================================================================
# Procedure: sp_registrar_atendimento_completo
# ==============================================================================

class TestSpRegistrarAtendimento:

    def _ids_validos(self):
        id_paciente  = _primeiro_id("paciente", "id_pessoa")
        id_residente = _primeiro_id("residente", "id_profissional")
        id_preceptor = _primeiro_id("preceptor", "id_profissional")
        id_unidade   = _primeiro_id("unidade", "id_unidade")
        id_proc      = _primeiro_id("procedimento", "id_procedimento")
        return id_paciente, id_residente, id_preceptor, id_unidade, id_proc

    def test_criar_atendimento_sem_procedimentos(self):
        id_paciente, id_residente, id_preceptor, id_unidade, _ = self._ids_validos()
        if None in (id_paciente, id_residente, id_preceptor, id_unidade):
            pytest.skip("Dados insuficientes no banco para este teste.")

        novo_id = atendimento_repository.criar_atendimento(
            data_hora=datetime(2025, 6, 1, 10, 0),
            duracao_minutos=30,
            id_paciente=id_paciente,
            id_residente=id_residente,
            id_preceptor=id_preceptor,
            id_unidade=id_unidade,
            procedimentos=[],
        )
        assert novo_id is not None, "Deve retornar o id do novo atendimento"
        assert isinstance(novo_id, int)

    def test_criar_atendimento_com_procedimentos(self):
        id_paciente, id_residente, id_preceptor, id_unidade, id_proc = self._ids_validos()
        if None in (id_paciente, id_residente, id_preceptor, id_unidade, id_proc):
            pytest.skip("Dados insuficientes no banco para este teste.")

        procedimentos = [{"id_procedimento": id_proc, "quantidade": 1,
                          "tempo_real": 10, "observacao": "Teste automático"}]

        novo_id = atendimento_repository.criar_atendimento(
            data_hora=datetime(2025, 6, 1, 10, 30),
            duracao_minutos=45,
            id_paciente=id_paciente,
            id_residente=id_residente,
            id_preceptor=id_preceptor,
            id_unidade=id_unidade,
            procedimentos=procedimentos,
        )
        assert novo_id is not None
        # Verifica se o procedimento foi de fato inserido
        rows = executar_query(
            "SELECT * FROM procedimento_realizado WHERE id_atendimento = %s",
            (novo_id,),
            fetch=True,
        )
        assert len(rows) == 1, "Deve existir 1 procedimento associado ao atendimento"


# ==============================================================================
# Procedure: sp_calcular_tempo_medio_espera
# ==============================================================================

class TestSpTempoMedioEspera:

    def test_retorna_lista(self):
        resultado = atendimento_repository.tempo_medio_espera()
        assert isinstance(resultado, list)
        for row in resultado:
            assert "id_unidade" in row
            assert "unidade" in row
            assert "total_atendimentos_analisados" in row
            assert "tempo_medio_espera_minutos" in row


# ==============================================================================
# Procedure: sp_reajustar_escala
# ==============================================================================

class TestSpReajustarEscala:

    def _escala_existente(self):
        rows = executar_query(
            "SELECT id_residente, dia_semana, turno FROM escala LIMIT 1",
            fetch=True,
        )
        return rows[0] if rows else None

    def test_reajuste_para_dia_inexistente_funciona(self):
        """Testa reajuste para um slot que não existe (deve ter sucesso)."""
        escala = self._escala_existente()
        if escala is None:
            pytest.skip("Nenhuma escala no banco para testar.")

        id_residente = escala["id_residente"]
        dia_origem   = escala["dia_semana"]
        turno_origem = escala["turno"]

        # Monta destino diferente — usa 'domingo' como destino (assumindo que não existe)
        dias = ["domingo", "segunda", "terca", "quarta", "quinta", "sexta", "sabado"]
        turnos = ["manha", "tarde", "noite"]

        dia_destino = next((d for d in dias if d != dia_origem), "domingo")
        turno_destino = next((t for t in turnos if t != turno_origem), "noite")

        # Verifica se o destino não existe para esse residente (para não gerar conflito real)
        conflito = executar_query(
            "SELECT COUNT(*) AS c FROM escala WHERE id_residente=%s AND dia_semana=%s AND turno=%s",
            (id_residente, dia_destino, turno_destino),
            fetch=True,
        )
        if conflito[0]["c"] > 0:
            pytest.skip("Destino já ocupado, pulando para evitar falso negativo.")

        # Chama o reajuste — não deve lançar exceção
        escala_repository.reajustar_escala(
            id_residente, dia_origem, turno_origem, dia_destino, turno_destino
        )

        # Restaura o estado original
        escala_repository.reajustar_escala(
            id_residente, dia_destino, turno_destino, dia_origem, turno_origem
        )

    def test_reajuste_com_conflito_lanca_erro(self):
        """Quando o destino já está ocupado, a procedure sinaliza erro."""
        rows = executar_query(
            """
            SELECT id_residente, dia_semana, turno
            FROM escala
            GROUP BY id_residente, dia_semana, turno
            HAVING COUNT(*) >= 1
            LIMIT 2
            """,
            fetch=True,
        )
        if len(rows) < 2:
            pytest.skip("Precisamos de pelo menos 2 escalas distintas para testar conflito.")

        r1, r2 = rows[0], rows[1]
        # Tenta mover r1 para onde r2 já está (mesmo residente)
        if r1["id_residente"] != r2["id_residente"]:
            pytest.skip("Os 2 slots pertencem a residentes diferentes; não gera conflito.")

        import mysql.connector
        with pytest.raises(mysql.connector.Error):
            escala_repository.reajustar_escala(
                r1["id_residente"],
                r1["dia_semana"],
                r1["turno"],
                r2["dia_semana"],
                r2["turno"],
            )
