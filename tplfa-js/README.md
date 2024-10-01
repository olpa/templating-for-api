# JS/TS utilities

Installation:

```
npm install https://github.com/olpa/templating-for-api/releases/download/tplfa-v1.0.0/tplfa-v1.0.0.tar.gz
```

## Client workflow

For setup, create instances of

- `jsonnet` from `tplfa-jsonnet` package
- `TplfaValidator`
- `TemplatingForApi`

Run a query-template:

- Put the prompt and the secret to `TplfaReqVars`
  - If the template is a part of a chain, put the previous output to `parent`
- Load the code of the request template to `requestTemplate`
  - If the template is from `tpfa-apis` package, use `loadLibTemplates` followed by `loadTemplate` from `nodejs-loader.ts`
- Call `TemplatingForApi.toTplfaRequest`
  - You get a validated output of type `TplfaRequest`

Query an API:

- Call `TemplatingForApi.toRequest` to convert `Request` from `tplfa` type to `fetch` type
- Call `fetch`

Run a document-template:

Similar to running a query-template.


## Chain of templates

Workflow:

- Define a template loader
- Create an instance of `ApiClient`
- Create a chain of templates as `TplfaTransformationVars[]`
- `ApiClient.call`

Complete example: [../in-action/nodejs-tplfa/](../in-action/nodejs-tplfa/).
