# Templating for API

One tool for several generative AIs: we need a common interface to do so.

Tplfa ("templating for api") defines such common interface and provides API-specific templates.

The templates are written in [jsonnet](https://jsonnet.org/) and can be used in most popular languages.

Tplfa is a part of [Gewova collaborative prompt engineering](https://gewova.com/) project. Tplfa is published under permissive [MIT license](./LICENSE.txt) and can be included in commercial applications.

# In action

```
cd in-action/nodejs-cli/
export OPENAI_API_KEY=...
npx ts-node src/index.ts --debug \
  --api ../../apis/openai/lib \
  --prompt "Tell me a joke about APIs."
```

The prompt is converted to a fetch-object:

```
{
   "url": "https://api.openai.com/v1/chat/completions",
   "method": "POST",
   "headers": {
      "Authorization": "...",
      "Content-type": "application/json"
   },
   "body": {
      "messages": [
         {
            "content": "Tell me a joke about APIs.",
            "role": "user"
         }
      ],
      "model": "gpt-3.5-turbo"
   }
}
```

The response from OpenAI is converted to the document representation:

```
{
  "doc": [
    {
      "content": [
        {
          "text": "Why did the API go to therapy? \n\nBecause it couldn't handle all the rejection codes!",
          "type": "text"
        }
      ],
      "type": "markdown"
    }
  ]
}
```

# APIs

At the moment, there is only a template for [OpenAI chat completion](https://platform.openai.com/docs/api-reference/chat).

## How to contribute an API

- Copy-paste the openai template to a new directory
- Modify the templates and update tests

# Contents

- [./apis/](./apis/)
- [./tplfa/](./tplfa/): JSON validation schemas for template output
- [./in-action/nodejs-cli/](./in-action/nodejs-cli/): Command-like tool to run templates and use APIs
- [./jsonnet/](./jsonnet/): Typescript library
