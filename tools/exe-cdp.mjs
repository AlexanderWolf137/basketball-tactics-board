// Acceptance harness: talks to the running exe's WebView2 via CDP.
// Launch exe with WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS=--remote-debugging-port=9222
// Usage: node tools/exe-cdp.mjs "<js expression>"   (evaluated in the exe page, awaitPromise)
const expr = process.argv[2];
const list = await (await fetch('http://127.0.0.1:9222/json/list')).json();
const page = list.find(t => t.type === 'page' && t.webSocketDebuggerUrl);
if (!page) { console.error('no debuggable page target', list.map(t => [t.type, t.url])); process.exit(1); }
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
const result = await new Promise((res, rej) => {
  const timer = setTimeout(() => rej(new Error('cdp timeout')), 60000);
  ws.onmessage = ev => {
    const msg = JSON.parse(ev.data);
    if (msg.id === 1) { clearTimeout(timer); res(msg.result); }
  };
  ws.send(JSON.stringify({ id: 1, method: 'Runtime.evaluate', params: { expression: expr, awaitPromise: true, returnByValue: true } }));
});
ws.close();
if (result.exceptionDetails) { console.error('PAGE EXCEPTION:', JSON.stringify(result.exceptionDetails)); process.exit(2); }
console.log(JSON.stringify(result.result.value ?? result.result, null, 2));