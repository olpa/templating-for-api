# nodejs cli interface to generative ai

Sample run:

```
npm ci # run once to setup the project

export LLM_API_KEY=....
./node_modules/.bin/ts-node src/index.ts \
  --api ../../apis/openai/lib \
  --prompt "Hi! Who are you and who created you?"
```

Options:

- `--help`
- `--debug`
- `--secret1`: default is the value of the environment variable `LLM_API_KEY`
- `--secret2`
- `--prompt`
- `--api`: Path to the api dir with files `request-tpl.jsonnet` and `document-tpl.jsonnet`. Several `--api` options create a chain of templates: the output of the previous template is passed to the next template as the parameter `parent`

The values of `secret1`, `secret2` and `prompt` are passed as the corresponding parameters to the request templates. See [../../apis/README.md](../../apis/README.md).

Example how to run a patch template:

```
./node_modules/.bin/ts-node src/index.ts \
  --api ../../apis/openai/lib \
  --api ../../apis/openai-patch-example/lib \
  --prompt "Hi!"
```
