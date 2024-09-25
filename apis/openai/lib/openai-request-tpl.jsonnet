local secret1 = std.extVar("secret1");
local secret2 = std.extVar("secret2");
local prompt = std.extVar("prompt");

local run() = {
  "url": "https://api.openai.com/v1/chat/completions",
  "headers": {
    "Content-type": "application/json",
    "Authorization": "Bearer " + secret1,
    [if secret2 != '' then "OpenAI-Organization"]: secret2,
  },
  "body": {
    "model": "gpt-3.5-turbo",
    "messages": [
      {
        "role": "user",
        "content": prompt
      }
    ]
  },
  "method": "POST"
};

{ "run": run }
