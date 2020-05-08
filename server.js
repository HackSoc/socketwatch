const WebSocket = require('ws');

const port = process.argv.length > 2 ? parseInt(process.argv[2]) : 8080;
if(isNaN(port)) {
    console.error("First argument must be a valid port number!");
    process.exit(1);
}

const wss = new WebSocket.Server({
    port: port
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
        mappings.set(ws.id, u.origin + u.pathname + u.search);
        let count = 0;
        for (let [k,v] of mappings.entries()) {
            if(v == u.origin + u.pathname + u.search) 
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
