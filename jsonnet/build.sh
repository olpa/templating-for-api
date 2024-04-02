set -eu

mkdir -p dist
cp ~/opt/go-jsonnet/libjsonnet.wasm ./dist/
cp $(go env GOROOT)/misc/wasm/wasm_exec.js ./dist/

