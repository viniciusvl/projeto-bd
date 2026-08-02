"""
Helper para consultar VIEWs do banco (vw_pacientes_internados,
vw_residentes_sem_supervisor, vw_estatisticas_atendimentos_mensal) sem SQL
cru e sem precisar mapear manualmente cada coluna em models.py.
"""

from functools import lru_cache

from sqlalchemy import MetaData, Table
from sqlalchemy.engine import Engine


@lru_cache(maxsize=None)
def get_view(engine: Engine, nome_view: str) -> Table:
    """Reflete (uma única vez, com cache) e retorna a Table de uma view."""
    metadata = MetaData()
    return Table(nome_view, metadata, autoload_with=engine)