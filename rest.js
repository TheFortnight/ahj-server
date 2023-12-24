const http = require('http');
const Koa = require('koa');
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

// TODO: write code here
//console.log('ROUTER: ', router.allowedMethods);
app.use(router());

const  port = process.env.PORT || 8181;
const server = http.createServer(app.callback());
server.listen(port);