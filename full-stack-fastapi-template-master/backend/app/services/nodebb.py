import requests

NODEBB_URL = "http://localhost:4567/api/v3"
TOKEN = "你的nodebb token"

headers = {
    "Authorization": f"Bearer {TOKEN}",
    "Content-Type": "application/json"
}


def get_categories():
    res = requests.get(f"{NODEBB_URL}/categories", headers=headers)
    return res.json()


def create_topic(cid: int, title: str, content: str):
    data = {
        "cid": cid,
        "title": title,
        "content": content
    }
    res = requests.post(f"{NODEBB_URL}/topics", json=data, headers=headers)
    return res.json()