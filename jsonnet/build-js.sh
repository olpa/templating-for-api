set -eu

docker run \
  -v $(pwd)/dist:/dist \
  -v $(pwd)/typescript:/src \
  mcr.microsoft.com/devcontainers/typescript-node:20 \
  bash -c " \
cp /src/jsonnet.ts /tmp/jsonnet.ts &&
sed 's/export//' --in-place /tmp/jsonnet.ts &&
tsc /tmp/jsonnet.ts --outFile /dist/jsonnet.js --target es2017
  "

