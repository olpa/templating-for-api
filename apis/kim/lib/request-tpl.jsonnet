local secret1 = std.extVar("secret1");
local prompt = std.extVar("prompt");

{
  "url": "https://backend.bf-burdacopilot-staging.aws.bfops.io/v1/chat/http",
  "headers": {
    "Content-type": "application/json",
    "Authorization": "Bearer " + secret1,
  },
  "body": {
    "provider": "azure-gpt3-5-turbo",
    "messages": [
      {
        "role": "user",
        "content": prompt
      }
    ]
  },
  "method": "POST"
}
