import os

import uvicorn
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from api.routers import atendimento, paciente, procedimento, profissional, relatorio
from exceptions.errors import AppException

app = FastAPI(
    title="API do sistema de gerenciamento hospitalar Dra. Yuska",
    root_path=os.getenv("ROOT_PATH", ""),
)

# Libera o acesso a partir do frontend (browser chama a API de outra origem).
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(atendimento.router)
app.include_router(paciente.router)
app.include_router(procedimento.router)
app.include_router(profissional.router)
app.include_router(relatorio.router)


@app.exception_handler(AppException)
def app_exception_handler(request: Request, exc: AppException):
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.message})


@app.get("/")
def health():
    return {"status": "API está rodando"}


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000)
