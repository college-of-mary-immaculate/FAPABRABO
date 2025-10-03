import uvicorn
from api.app import app   # <- point directly to app.py

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8080, reload=True)
