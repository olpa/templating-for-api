local openai = import "openai-request-tpl.jsonnet";
local secret2 = std.extVar("secret2");

openai.run("https://api.openai.com/v1/chat/completions", "bearer") + {
  headers+: {
    [if secret2 != "" then "OpenAI-Organization"]: secret2,
  },
  body+: {
    model: "gpt-3.5-turbo",
  },
}
