set -eu

cp ../jsonnet-wasm/dist/libjsonnet.wasm ../jsonnet-wasm/dist/wasm_exec.js ./dist/
cp ./typescript/jsonnet.ts ./dist/

docker run \
  -v $(pwd)/dist:/dist \
  -v $(pwd)/typescript:/src \
  mcr.microsoft.com/devcontainers/typescript-node:20 \
  bash -c " \
cp /src/jsonnet.ts /tmp/jsonnet.ts &&
sed 's/export//' --in-place /tmp/jsonnet.ts &&
tsc /tmp/jsonnet.ts --outFile /dist/jsonnet-js.js --target es2017
  "
