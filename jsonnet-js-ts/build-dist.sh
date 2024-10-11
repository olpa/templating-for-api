set -eu

cp ../jsonnet-wasm/dist/libjsonnet.wasm ../jsonnet-wasm/dist/wasm_exec.js ./dist/

docker run \
  -u $(id -u):$(id -g) \
  -v $(pwd)/src:/src \
  -v $(pwd)/dist:/dist \
  mcr.microsoft.com/devcontainers/typescript-node:20 \
  bash -c " \
tsc /src/jsonnet.ts --outDir /dist/ --target es2017 --module commonjs --declaration true &&
  cp /dist/jsonnet.js /dist/jsonnet-web.js &&
  sed 's/^.*exports.*$//' --in-place /dist/jsonnet-web.js
  "

cp README.md changelog.md ./dist/
sed --in-place 's#\.\./#https://github.com/olpa/templating-for-api/tree/master/#g' ./dist/README.md
