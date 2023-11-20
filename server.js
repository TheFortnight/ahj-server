const http = require('http');
const Koa = require('koa');
const { koaBody } = require('koa-body');

const app = new Koa();
console.log('TYPE: '+typeof koaBody);

app.use(koaBody({
  urlencoded: true,
}));

app.use((ctx, next) => {
  console.log('ctx.request.body:' + JSON.stringify(ctx.request.body));

  ctx.response.set('Access-Control-Allow-Origin', '*');

  ctx.response.body = 'server response';
  next();
});

app.use((ctx, next) => {
  console.log('2nd middlewear');
  
  //next();
});

const server = http.createServer(app.callback());
/*const server = http.createServer((req, res) => {
 console.log(req.url);

  const buffer = [];

  req.on('data', (chunk) => {
    buffer.push(chunk);
  });

  req.on('end', () => {
    const data = Buffer.concat(buffer).toString();
    console.log(data)
  });

  res.end('server response');
});*/

const port = 8181;

server.listen(port, (err) => {
  if (err) {
    console.log(err);
    return;
  }
  console.log('Server is listening to ' + port);
});