from fastapi import FastAPI
import pymysql
import json
import os

app = FastAPI()

@app.get("/")
def read_root():
    return {"Hello": "World"}
