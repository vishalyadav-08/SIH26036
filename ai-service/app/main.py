from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from app.api import health, chat
from app.core.logging import logger

app = FastAPI(
    title="MapanSetu AI Assistant Service",
    description="Standalone AI Assistant backend. Note: AI Provider is not yet integrated (Bootstrap Phase).",
    version="0.1.0"
)

@app.on_event("startup")
async def startup_event():
    logger.info("Starting MapanSetu AI Assistant Service (Bootstrap Phase)")

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    logger.warning("Request validation error")
    return JSONResponse(
        status_code=422,
        content={"code": "VALIDATION_ERROR", "message": "Invalid chat request."}
    )

@app.exception_handler(Exception)
async def generic_exception_handler(request, exc):
    logger.error("Unexpected internal error occurred")
    return JSONResponse(
        status_code=500,
        content={"code": "INTERNAL_ERROR", "message": "An unexpected error occurred."}
    )

app.include_router(health.router)
app.include_router(chat.router, prefix="/api/v1")
