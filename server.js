const http = require('http');
const Koa = require('koa');
const { koaBody } = require('koa-body');
const app = new Koa();
const path = require('path');
const fs = require('fs');
const uuid = require('uuid');
const koaStatic = require('koa-static');

let subscriptions = [];
console.log('TYPE: '+typeof koaBody);

// => Static file handling
const public = path.join(__dirname, '/public');

app.use(koaStatic(public));

app.use(koaBody({
  urlencoded: true,
  multipart: true
})); 

app.use((ctx, next) => {
  
  if (ctx.request.method !== 'OPTIONS') {
    next();
    return;
  };

  ctx.response.set('Access-Control-Allow-Origin', '*');
  ctx.response.set('Access-Control-Allow-Methods', 'DELETE, PUT, PATCH, POST, GET');
  ctx.response.status = 204;});

  app.use((ctx, next) => {

    if (ctx.request.method !== 'POST' && ctx.request.url !== '/upload') {
  
      next();  
      return;
    }
  
    ctx.response.set('Access-Control-Allow-Origin', '*');
    ctx.response.set('Access-Control-Allow-Methods', 'DELETE, PUT, PATCH, POST, GET');
    
    let fileName;

    try {
    

    const { file } = ctx.request.files;

    const subfolder = uuid.v4();

    const uploadFolder = public + '/' + subfolder;

    //console.log('FILE PATH:', file.filepath)

    fs.mkdirSync(uploadFolder);

    fs.copyFileSync(file.filepath, uploadFolder + '/' + file.originalFilename);

    fileName = '/' + subfolder + '/' + file.originalFilename;
    
    ctx.response.body = fileName;

    } catch (error) {
      console.log('ERROR: ', error);
      ctx.response.status = 500;

      return;
    }

    
  
    next();
  
  });


/*app.use((ctx, next) => {

  if (ctx.request.method !== 'POST') {

    console.log('NOT POST REQ!');

    next();

    return;
  }

  //console.log('POST: ', ctx.request.body);

  ctx.response.set('Access-Control-Allow-Origin', '*');

  let { name, phone } = ctx.request.body;

  if (subscriptions.some(sub => sub.phone === phone)) {
    ctx.response.status = 400;
    ctx.response.body = 'subscription exists';

    return;
  }
  subscriptions.push({ name, phone});

  ctx.response.body = 'KOK';

  next();

});*/

app.use((ctx, next) => {

  if (ctx.request.method !== 'DELETE') {
    console.log('NOT DELETE REQ!');
    next();

    return;
  }

  console.log('DELETE: ', ctx.request.query);

  ctx.response.set('Access-Control-Allow-Origin', '*');

  const { phone } = ctx.request.query;

  if (subscriptions.every(sub => sub.phone !== phone)) {
    ctx.response.status = 400;
    ctx.response.body = 'subscription doesn\'t exists';

    return;
  }


  subscriptions = subscriptions.filter(sub => sub.phone !== phone);

  ctx.response.body = 'Subscription deleted';

  next();


  if (ctx.request.method !== 'DELETE') {
    console.log('NOT DELETE REQ!');
    next();

    return;
  }

  console.log('DELETE: ', ctx.request.query);

  ctx.response.set('Access-Control-Allow-Origin', '*');

  const { phone1 } = ctx.request.query;

  if (subscriptions.every(sub => sub.phone !== phone1)) {
    ctx.response.status = 400;
    ctx.response.body = 'subscription doesn\'t exists';

    return;
  }


  subscriptions = subscriptions.filter(sub => sub.phone !== phone1);

  ctx.response.body = 'Subscription deleted';

  next();

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