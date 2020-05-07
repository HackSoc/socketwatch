const WebSocket = require('ws');

const wss = new WebSocket.Server({
    port: 8080
});

const heartbeatInterval = 3000;

function heartbeat() {
    this.isAlive = true;
}

let mappings = new Map()

wss.on('connection', (ws, req) => {
    ws.id = req.headers['sec-websocket-key'];

    // setup ws here
    ws.on('message', data => {
        let u = new URL(data);
        if(u.origin != req.headers['origin']) {
            console.log(u.origin);
            console.log(req.headers['origin']);
            ws.close(1008, "Mismatched Origin");
        }
        mappings.set(ws.id, u.origin + u.pathname);
        let count = 0;
        for (let [k,v] of mappings.entries()) {
            if(v == u.origin + u.pathname) 
                count++;
        }
        ws.send(count);
    });

    ws.on('pong', heartbeat);

    setInterval(()=>{
        if(ws.isAlive === false) {
            ws.terminate();
        }
        else {
            ws.isAlive = false;
            ws.ping(()=>{});
        }
    }, heartbeatInterval);

    ws.on('close', () => {
        mappings.delete(ws.id);
    });
})
