local openai = import 'openai-request-tpl.jsonnet';

openai.run('https://api.anthropic.com/v1/messages', 'key') + {
  headers+: {
    "Anthropic-version": "2023-06-01",
  },
  body+: {
    "max_tokens": 1024,
    "model": "claude-3-5-sonnet-20240620",
  }
}
