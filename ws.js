const http = require('http');
const Koa = require('koa');
const WS = require('ws');
const router = require('./routes');
const app = new Koa();
const { koaBody } = require('koa-body');

app.use(koaBody({
    urlencoded: true,
    multipart: true
}));

app.use(async (ctx, next) => {
    const origin = ctx.request.get('Origin');
    if (!origin) {
        return await next();
    };

    const headers = { 'Access-Control-Allow-Origin': '*' };

    if (ctx.request.method !== 'OPTIONS') {
        ctx.response.set({ ...headers});
        try {
            return await next();
        } catch (e) {
            e.headers = { ...e.headers, ...headers };
        }
    };

    if (ctx.request.get('Access-Control-Request-Method')) {
        ctx.response.set({
            ...headers,
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH'
        });

        if (ctx.request.get('Access-Control-Request-Headers')) {
            ctx.response.set('Access-Control-Allow-Headers', ctx.request.get('Access-Control-Request-Headers'))
        }

        ctx.response.status = 204;

        next();
    }
});


app.use(router());

const  port = process.env.PORT || 8181;
const server = http.createServer(app.callback());

const wsServer = new WS.Server({
    server
});

const chat = ['welcome to our chat!'];

wsServer.on('connection', (ws) => {

    ws.on('message', (msg) => {
        const message = msg.toString();

        chat.push(message);
        console.log('Message: ', message);

        const eventData = JSON.stringify({ chat: [message]});

        Array.from(wsServer.clients)
            .filter(client => client.readyState === WS.OPEN)
            .forEach(client => client.send(eventData));
    });
    
    ws.send(JSON.stringify({ chat }));
});

server.listen(port);