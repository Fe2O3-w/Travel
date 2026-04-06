from fastapi import APIRouter
from app.services import nodebb

router = APIRouter()

@router.get("/categories")
def categories():
    return nodebb.get_categories()


@router.post("/post")
def create_post(cid: int, title: str, content: str):
    return nodebb.create_topic(cid, title, content)