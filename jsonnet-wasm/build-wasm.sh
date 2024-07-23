set -eu

GO_VERSION=1.22.2
JSONNET_VERSION=0.20.0

docker run \
  -v $(pwd)/dist:/dist \
  golang:$GO_VERSION bash -c " \
wget https://github.com/google/go-jsonnet/archive/refs/tags/v$JSONNET_VERSION.tar.gz && \
tar zxf v$JSONNET_VERSION.tar.gz && \
cd go-jsonnet-$JSONNET_VERSION && \
GOOS=js GOARCH=wasm go build -o libjsonnet.wasm ./cmd/wasm && \
cp libjsonnet.wasm /dist/ && \
cp \$(go env GOROOT)/misc/wasm/wasm_exec.js /dist/
"
