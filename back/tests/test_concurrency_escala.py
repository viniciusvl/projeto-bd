import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

import threading
import time
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError, DBAPIError, SQLAlchemyError
from sqlalchemy.orm.exc import StaleDataError

from db.connect import SessionLocal
from db.models import Escala

ID_RESIDENTE = 10 # inserir um id de residente existente
ID_PRECEPTOR = 19 # inserir um id de preceptor existente
DIA_SEMANA = 'segunda'
TURNO = 'manha'
ID_UNIDADE_1 = 1
ID_UNIDADE_2 = 2

def add_escala(session, id_unidade, thread_name):
    escala = Escala(
        id_unidade=id_unidade,
        dia_semana=DIA_SEMANA,
        turno=TURNO,
        id_residente=ID_RESIDENTE,
        id_preceptor=ID_PRECEPTOR,
    )
    session.add(escala)
    try:
        session.commit()
        print(f"[SUCCESS][{thread_name}] Escala adicionada: id_unidade={id_unidade}")
    except (IntegrityError, DBAPIError, StaleDataError, SQLAlchemyError) as exc:
        session.rollback()
        print(f"[ERROR][{thread_name}] Falha ao adicionar escala para id_unidade={id_unidade}: {exc}")
    finally:
        session.close()

def concurrent_insert():
    session1 = SessionLocal()
    session2 = SessionLocal()
    t1 = threading.Thread(target=add_escala, args=(session1, ID_UNIDADE_1, 'T1'))
    t2 = threading.Thread(target=add_escala, args=(session2, ID_UNIDADE_2, 'T2'))

    t1.start()
    t2.start()

    t1.join()
    t2.join()

if __name__ == '__main__':
    concurrent_insert()
