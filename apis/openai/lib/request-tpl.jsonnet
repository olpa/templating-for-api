{
  "url": "https://api.openai.com/v1/chat/completions",
  "headers": {
    "Content-type": "application/json",
    "Authorization": "Bearer " + std.extVar("secret1"),
    [if std.extVar("secret2") != ''
      then "OpenAI-Organization"]: std.extVar("secret2"),
  },
  "body": {
    "model": "gpt-3.5-turbo",
    "messages": [
      {
        "role": "user",
        "content": std.extVar("prompt")
      }
    ]
  },
  "method": "POST"
}
