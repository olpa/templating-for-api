# API definitions

## File layout, running a test

For an api `foo`, the templates are:

- `foo/lib/request-tpl.jsonnet` and
- `foo/lib/document-tpl.jsonnet`.

There are also test files to check conversion.

```
cd foo
npm ci # once to setup the test project
npm test # run tests
```

## Sample run

Using [jsonnet](https://jsonnet.org/) command-line tool:

```
jsonnet --jpath ./lib ./openai/lib/request-tpl.jsonnet -V prompt=hello \
    -V secret1=TOKEN -V secret2=orgid
```

Output:

```
{
   "body": {
      "messages": [
         {
            "content": "hello",
            "role": "user"
         }
      ],
      "model": "gpt-3.5-turbo"
   },
   "headers": {
      "Authorization": "Bearer TOKEN",
      "Content-type": "application/json",
      "OpenAI-Organization": "orgid"
   },
   "method": "POST",
   "url": "https://api.openai.com/v1/chat/completions"
}
```

## Request templates

Input:

- `secret1`: First secret, usually an API key
- `secret2`: Optionally second secret. In case of OpenAI API, it's an organization ID
- `prompt`
- `parent`: When using in a chain of templates, `parent` contains the output of the previous template. See `openai-patch-example` how to patch the transformation.

Output:

An object, ready to use for [fetch](https://developer.mozilla.org/en-US/docs/Web/API/fetch). The expected fields:

- `url`
- `method`
- `headers`
- `body`: Type is the `json object`, not `string`

The header `Content-type: application/json` is often required by APIs, even if not mentioned in documentation.

There is a JSON schema for validation: [./schemas/request.json](./schemas/request.json).

## Document templates

Input:

- `response`: body payload

Output:

```
{
  doc: [
    {
      type: 'markdown',
      content: [
        {
          type: 'text',
          text: ... whatever ...
        }
      ]
    }
  ]
}
```

There could be several `type: markdown' objects.

There is a JSON schema for validation: [./schemas/document.json](./schemas/document.json).

The document structure will be more rich in the future. It will be based on the [ProseMirror's document model](https://prosemirror.net/docs/guide/#doc).

# Using in NPM

```
npm install https://github.com/olpa/templating-for-api/releases/download/apis-v1.1.1/apis-v1.1.1.tar.gz
```
