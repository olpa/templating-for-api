local secret1 = std.extVar("secret1");
local prompt = std.extVar("prompt");

local run(url, auth_loc) = {
  "url": url,
  "headers": {
    "Content-type": "application/json",
  } + (
    if auth_loc == "bearer" then
      { "Authorization": "Bearer " + secret1 }
    else if auth_loc == "key" then
      { "X-api-key": secret1 }
    else
      error "Unknown auth_loc"
  )
  ,
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
