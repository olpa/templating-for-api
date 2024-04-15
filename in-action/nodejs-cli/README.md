```
export OPENAI_API_KEY=$(pass api/openai/gewova)
npx ts-node src/index.ts \
  --api ../../apis/openai/lib \
  --api ../../apis/openai-patch-example/lib \
  --prompt "tell me a joke"
```
