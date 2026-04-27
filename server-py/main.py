import time

import uvicorn
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from metrics import record_request
from routes import router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def track_requests(request: Request, call_next):
    start = time.perf_counter()
    response = await call_next(request)
    record_request((time.perf_counter() - start) * 1000)
    return response


app.include_router(router, prefix="/api")

if __name__ == "__main__":
    print("  API server → http://localhost:8000/api")
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
