import os

import mysql.connector


def get_connection():
    return mysql.connector.connect(
        host=os.getenv("DB_HOST", "localhost"),
        port=int(os.getenv("DB_PORT", "3306")),
        user=os.getenv("DB_USER", "root"),
        password=os.getenv("DB_PASSWORD", "root"),
        database=os.getenv("DB_NAME", "hospital"),
        charset="utf8mb4",
        collation="utf8mb4_unicode_ci",
    )


def executar_query(sql, dados=(), fetch=False):
    conn = get_connection()
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute(sql, dados)
        if fetch:
            resultado = cursor.fetchall()
        else:
            resultado = (cursor.rowcount, cursor.lastrowid)
        conn.commit()
        return resultado
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()
