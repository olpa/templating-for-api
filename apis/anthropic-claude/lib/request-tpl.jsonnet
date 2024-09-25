local openai = import 'openai-request-tpl.jsonnet';

openai.run() + {
  body+: {
    n: 3,
    temperature: 0.8,
  }
}
