local model = "gemini-1.5-pro";
local key = std.extVar("secret1");
local prompt = std.extVar("prompt");

{
  "url": "https://generativelanguage.googleapis.com/v1beta/models/%(model)s:generateContent?key=%(key)s" % {"model": model, "key": key},
  "headers": {
    "Content-type": "application/json",
  },
  "body": {
    "contents": [{
      "parts": [{
        "text": prompt
      }],
    }],
  },
}
