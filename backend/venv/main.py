from fastapi import FastAPI

app = FastAPI(title="CoDesign API")

@app.get("/")
async def root():
    return {"message": "CoDesign Backend is Live"}