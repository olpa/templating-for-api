local openai = import "openai-request-tpl.jsonnet";

openai.run("https://api.mistral.ai/v1/chat/completions", "bearer") + {
  body+: {
    model: "mistral-large-latest",
  },
}
