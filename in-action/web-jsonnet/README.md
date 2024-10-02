# Using jsonnet in a browser

`index.html` is a working example of using jsonnet in a browser.

A browser rejects to run WebAssembly if `index.html` is opened as a file from the file system. You have to start a web server locally and load the example from this local server.

To start the server:


```
python3 server.py
```

Then point a browser to <http://localhost:8000>.
