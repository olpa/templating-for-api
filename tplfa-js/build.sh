tsc
sed 's/^.*exports.*$//' --in-place ./dist/*.js
cp package.json ./dist/
sed 's/"file:.*"/"^1.0.0"/' --in-place ./dist/package.json
