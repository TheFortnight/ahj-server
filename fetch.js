const http = require('http');
const Koa = require('koa');
const Router = require ('koa-router');
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

let subscriptions = [];

app.use((ctx, next) => {
    if (ctx.request.method !== 'POST') {
        next();

        return;
    }

    console.log('POST: ', ctx.request.body);

    const { name, phone } = ctx.request.body;

    ctx.response.set('Access-Control-Allow-Origin', '*');

    if (subscriptions.some(sub => sub.phone === phone)) {
        ctx.response.status = 400;
        ctx.response.body = '{ "status": "subscription exists" }';

        return;
    }

    subscriptions.push({ name, phone });

    ctx.response.body = '{ "status": "OK" }';

    next();
});

app.use((ctx, next) => {
    if (ctx.request.method !== 'DELETE') {
        next();

        return;
    }

    console.log('QUERY: ', ctx.request.query);

    const { phone } = ctx.request.query;

    ctx.response.set('Access-Control-Allow-Origin', '*');

    if (subscriptions.every(sub => sub.phone !== phone)) {
        ctx.response.status = 400;
        ctx.response.body = '{ "status": "subscription doesn\'t exist" }';

        return;
    }

    subscriptions = subscriptions.filter(sub => sub.phone !== phone);

    ctx.response.body = '{ "status": "OK" }';

    next();
})

const router = new Router();

// TODO: write code here

router.get('/index', async (ctx) => {
    ctx.response.body = 'hello there!';
});

app.use(router.routes()).use(router.allowedMethods());

const  port = process.env.PORT || 8181;
const server = http.createServer(app.callback());
server.listen(port);