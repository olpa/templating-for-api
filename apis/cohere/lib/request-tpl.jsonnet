local openai = import "openai-request-tpl.jsonnet";

openai.run("https://api.cohere.com/v2/chat", "bearer") + {
  body+: {
    model: "command-r",
  },
}
