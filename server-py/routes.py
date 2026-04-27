import time
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from db import get_db
from metrics import get_metrics
from simulate_ai import get_ai_response

router = APIRouter()


def _check_database() -> dict:
    start = time.perf_counter()
    try:
        with get_db() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT 1")
        return {"status": "online", "responseMs": int((time.perf_counter() - start) * 1000)}
    except Exception:
        return {"status": "offline", "responseMs": int((time.perf_counter() - start) * 1000)}


@router.get("/health")
def health():
    return {"status": "ok", **get_metrics()}


@router.get("/status")
def status():
    db = _check_database()
    metrics = get_metrics()
    return {
        "api": {"status": "online"},
        "pythonApi": {"status": "online", "responseMs": 0},
        "database": db,
        "metrics": metrics,
    }


def _derive_title(text: str) -> str:
    words = text.strip().split()
    joined = " ".join(words[:5])
    return f"{joined}…" if len(words) > 5 else joined


def _iso(dt: datetime) -> str:
    return dt.isoformat() if dt else None


# ── request bodies ────────────────────────────────────────────────────────────

class CreateConversationBody(BaseModel):
    title: str = "New conversation"


class UpdateConversationBody(BaseModel):
    title: str


class CreateMessageBody(BaseModel):
    content: str


# ── GET /conversations ────────────────────────────────────────────────────────

@router.get("/conversations")
def list_conversations():
    with get_db() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT
                    c.id,
                    c.title,
                    c.created_at,
                    COUNT(m.id)::int AS message_count,
                    (
                        SELECT content
                        FROM messages
                        WHERE conversation_id = c.id
                        ORDER BY timestamp DESC
                        LIMIT 1
                    ) AS last_message
                FROM conversations c
                LEFT JOIN messages m ON m.conversation_id = c.id
                GROUP BY c.id, c.title, c.created_at
                ORDER BY c.created_at DESC
            """)
            rows = cur.fetchall()

    return [
        {
            "id": r["id"],
            "title": r["title"],
            "createdAt": _iso(r["created_at"]),
            "messageCount": r["message_count"],
            "lastMessage": r["last_message"][:80] if r["last_message"] else None,
        }
        for r in rows
    ]


# ── POST /conversations ───────────────────────────────────────────────────────

@router.post("/conversations", status_code=201)
def create_conversation(body: CreateConversationBody):
    conv_id = f"conv-{int(time.time() * 1000)}"
    with get_db() as conn:
        with conn.cursor() as cur:
            cur.execute(
                "INSERT INTO conversations (id, title) VALUES (%s, %s) RETURNING *",
                (conv_id, body.title),
            )
            row = cur.fetchone()

    return {"id": row["id"], "title": row["title"], "createdAt": _iso(row["created_at"]), "messages": []}


# ── GET /conversations/:id ────────────────────────────────────────────────────

@router.get("/conversations/{conv_id}")
def get_conversation(conv_id: str):
    with get_db() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM conversations WHERE id = %s", (conv_id,))
            conv = cur.fetchone()
            if not conv:
                raise HTTPException(status_code=404, detail="Conversation not found")

            cur.execute(
                "SELECT * FROM messages WHERE conversation_id = %s ORDER BY timestamp ASC",
                (conv_id,),
            )
            messages = cur.fetchall()

    return {
        "id": conv["id"],
        "title": conv["title"],
        "createdAt": _iso(conv["created_at"]),
        "messages": [
            {
                "id": m["id"],
                "role": m["role"],
                "content": m["content"],
                "timestamp": _iso(m["timestamp"]),
            }
            for m in messages
        ],
    }


# ── PUT /conversations/:id ────────────────────────────────────────────────────

@router.put("/conversations/{conv_id}")
def update_conversation(conv_id: str, body: UpdateConversationBody):
    if not body.title.strip():
        raise HTTPException(status_code=400, detail="title is required")

    with get_db() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM conversations WHERE id = %s", (conv_id,))
            if not cur.fetchone():
                raise HTTPException(status_code=404, detail="Conversation not found")

            cur.execute(
                "UPDATE conversations SET title = %s WHERE id = %s RETURNING *",
                (body.title.strip(), conv_id),
            )
            row = cur.fetchone()

    return {"id": row["id"], "title": row["title"], "createdAt": _iso(row["created_at"])}


# ── DELETE /conversations/:id ─────────────────────────────────────────────────

@router.delete("/conversations/{conv_id}", status_code=204)
def delete_conversation(conv_id: str):
    with get_db() as conn:
        with conn.cursor() as cur:
            cur.execute("DELETE FROM conversations WHERE id = %s RETURNING id", (conv_id,))
            if not cur.fetchone():
                raise HTTPException(status_code=404, detail="Conversation not found")


# ── GET /conversations/:id/messages ──────────────────────────────────────────

@router.get("/conversations/{conv_id}/messages")
def list_messages(conv_id: str):
    with get_db() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT 1 FROM conversations WHERE id = %s", (conv_id,))
            if not cur.fetchone():
                raise HTTPException(status_code=404, detail="Conversation not found")

            cur.execute(
                "SELECT * FROM messages WHERE conversation_id = %s ORDER BY timestamp ASC",
                (conv_id,),
            )
            rows = cur.fetchall()

    return [
        {"id": m["id"], "role": m["role"], "content": m["content"], "timestamp": _iso(m["timestamp"])}
        for m in rows
    ]


# ── POST /conversations/:id/messages ─────────────────────────────────────────

@router.post("/conversations/{conv_id}/messages", status_code=201)
async def create_message(conv_id: str, body: CreateMessageBody):
    if not body.content.strip():
        raise HTTPException(status_code=400, detail="content is required")

    with get_db() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM conversations WHERE id = %s", (conv_id,))
            conv = cur.fetchone()
            if not conv:
                raise HTTPException(status_code=404, detail="Conversation not found")

            cur.execute(
                "SELECT role, content FROM messages WHERE conversation_id = %s ORDER BY timestamp ASC",
                (conv_id,),
            )
            history = [dict(r) for r in cur.fetchall()]

    is_first = len(history) == 0
    all_messages = history + [{"role": "user", "content": body.content.strip()}]

    now_ms = int(time.time() * 1000)
    user_msg_id = f"msg-{now_ms}"
    user_ts = datetime.now(timezone.utc)

    with get_db() as conn:
        with conn.cursor() as cur:
            cur.execute(
                "INSERT INTO messages (id, conversation_id, role, content, timestamp) VALUES (%s, %s, %s, %s, %s) RETURNING *",
                (user_msg_id, conv_id, "user", body.content.strip(), user_ts),
            )
            user_row = cur.fetchone()

            if is_first:
                new_title = _derive_title(body.content)
                cur.execute("UPDATE conversations SET title = %s WHERE id = %s", (new_title, conv_id))

    ai_content = await get_ai_response(all_messages)
    ai_msg_id = f"msg-{int(time.time() * 1000)}"
    ai_ts = datetime.now(timezone.utc)

    with get_db() as conn:
        with conn.cursor() as cur:
            cur.execute(
                "INSERT INTO messages (id, conversation_id, role, content, timestamp) VALUES (%s, %s, %s, %s, %s) RETURNING *",
                (ai_msg_id, conv_id, "ai", ai_content, ai_ts),
            )
            ai_row = cur.fetchone()

            cur.execute("SELECT title FROM conversations WHERE id = %s", (conv_id,))
            title = cur.fetchone()["title"]

    return {
        "userMessage": {
            "id": user_row["id"],
            "role": user_row["role"],
            "content": user_row["content"],
            "timestamp": _iso(user_row["timestamp"]),
        },
        "aiMessage": {
            "id": ai_row["id"],
            "role": ai_row["role"],
            "content": ai_row["content"],
            "timestamp": _iso(ai_row["timestamp"]),
        },
        "title": title,
    }
