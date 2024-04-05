{
  "url": "https://api.openai.com/v1/chat/completions",
  "headers": {
    "Authorization": "Bearer " + std.extVar("secret1"),
    [if std.extVar("secret2") != ''
      then "OpenAI-Organization"]: std.extVar("secret2"),
  },
  "body": {
    "messages": [
      {
        "role": "user",
        "content": std.extVar("prompt")
      }
    ]
  }
}
