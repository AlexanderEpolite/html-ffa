
import Bun from "bun";

console.log(`starting an HTML FFA Server`);

const sockets = new Set<Bun.ServerWebSocket<unknown>>();

const server = Bun.serve({
    fetch(req, server) {
        if(req.url.endsWith("/ws")) {
            const success = server.upgrade(req);
            if(success) {
                return undefined;
            } else {
                return new Response("Upgrade failed", {
                    status: 400,
                });
            }
        }
        
        if(!req.url.endsWith("/") && !req.url.endsWith("index.html")) {
            return new Response(Bun.file("./public/game.html"), {
                headers: {
                    "Content-Type": "text/html",
                }
            });
        }
        
        return new Response(Bun.file("./public/index.html"), {
            headers: {
                "Content-Type": "text/html",
            }
        });
    },
    websocket: {
        async message(ws, message) {
            for(const socket of sockets) {
                try {
                    await socket.send(message);
                } catch(e) {
                    //usually a zombie socket
                }
            }
        },
        async open(ws) {
            sockets.add(ws);
        },
        async close(ws) {
            sockets.delete(ws);
        },
    },
    port: parseInt(process.argv[2], 10) || 8080,
    development: false,
})