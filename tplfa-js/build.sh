tsc

mv ./dist/src/* ./dist
rm ./dist/test/*
rmdir ./dist/src ./dist/test

cp package.json ./dist/

version_apis=$(cat ./node_modules/tplfa-apis/package.json | jq -r .version)
version_jsonnet=$(cat ./node_modules/tplfa-jsonnet/package.json | jq -r .version)
sed 's/"file:.*apis.*"/"^'$version_apis'"/' --in-place ./dist/package.json
sed 's/"file:.*jsonnet.*"/"^'$version_jsonnet'"/' --in-place ./dist/package.json
