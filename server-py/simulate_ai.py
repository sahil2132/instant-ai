import os

from openai import AsyncOpenAI

client = AsyncOpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=os.environ["OPENROUTER_API_KEY"],
)


async def get_ai_response(messages: list[dict]) -> str:
    # map our internal "ai" role to the OpenAI "assistant" role
    openai_messages = [
        {"role": "assistant" if m["role"] == "ai" else m["role"], "content": m["content"]}
        for m in messages
    ]

    response = await client.chat.completions.create(
        model="openai/gpt-oss-20b:free",
        messages=openai_messages,
    )
    content = response.choices[0].message.content
    print("→ openrouter response:", content)
    return content
