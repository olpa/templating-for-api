set -eu

cp ../jsonnet-wasm/dist/libjsonnet.wasm ../jsonnet-wasm/dist/wasm_exec.js ./dist/

docker run \
  -u $(id -u):$(id -g) \
  -v $(pwd)/src:/src \
  -v $(pwd)/dist:/dist \
  mcr.microsoft.com/devcontainers/typescript-node:20 \
  bash -c " \
tsc /src/jsonnet.ts --outDir /dist/ --target es2017 --module commonjs --declaration true
  "
