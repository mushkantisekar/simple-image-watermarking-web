const restify = require('restify');
const corsMiddleware = require('restify-cors-middleware');
const embedFunction = require('./embed');
const decodeFunction = require('./decode');

const port = process.env.PORT || 8888;

function embed(req, res, next) {
  let file = req.files['file'];
  let message = req.params['message'];
  let filePath = file.path;
  embedFunction(filePath, message).then((data) => {
    res.contentLength = Buffer.byteLength(data);
    res.contentType = 'image/png';
    res.send(data);
    return next();
  }).catch(err => {
    res.send(err);
    return next(err);
  });
}

function extract(req, res, next) {
  let file = req.files['file'];
  let filePath = file.path;
  decodeFunction(filePath).then((data) => {
    res.contentLength = Buffer.byteLength(data);
    res.contentType = 'text/plain';
    res.send(data);
    return next();
  }).catch((err) => {
    res.send(err);
    return next(err);
  });
}

const cors = corsMiddleware({
  origins: ['https://siwb-ui.onrender.com', 'http://localhost:8080']
});

const server = restify.createServer({
  strictFormatters: false
});
server.pre(cors.preflight);
server.use(cors.actual);
server.use(restify.plugins.bodyParser());
server.use(restify.plugins.throttle({
  burst: 10,
  rate: 1,
  ip: true,
  setHeaders: true
}));
server.post('/api/embed', embed);
server.post('/api/extract', extract);

server.listen(port, () => {
  console.log('%s listening at %s', server.name, server.url);
});