var Nightmare  = require('nightmare'),
    Promise    = require('bluebird'),
    Queue      = require('promise-queue'),
    express    = require('express'),
    bodyParser = require('body-parser'),
    uuid       = require('node-uuid'),
    fs         = require('fs'),
    config     = require('./config.json');

// Set promise-queue to use
// bluebird's promises.
Queue.configure(Promise);

var port        = process.env.PORT || config.port,
    timeout     = process.env.TIMEOUT || config.timeout,
    concurrency = process.env.CONCURRENCY || config.concurrency,
    nightmares  = Array(concurrency).fill().map(function() { return Nightmare(); }),
    queue       = new Queue(concurrency, Infinity),
    server      = express();

// Create the rendering engine for a new render call
function render(data) {
  var id        = uuid.v4(),
      output    = '/tmp/' + id + '.pdf',
      router    = express.Router(),
      nightmare = nightmares.pop(), // Get ourselves a nightmare worker
      deferred;

  server.use('/' + id, router);

  router.use(express.static(config.document_path));
  router.get('/data.json', function (req, res) {
    log('debug', 'Serving data.json for id ' + id);
    res.json(data);
  });
  router.get('/data', function (req, res) {
    log('debug', 'Serving data in javascript for id ' + id);
    res.type("text/javascript").send("var data = " + JSON.stringify(data));
  });
  router.get('/defer', function (req, res) {
    deferred = new Promise(function (resolve, reject) {
      router.get('/done', function (req, res) {
        log('debug', 'Document called done. id: ' + id);
        resolve();
        res.status(200).end();
      });

      setTimeout(function() {
        reject(new Error('Deferred rendering has exceeded the timeout'));
      }, timeout);
    });
    res.status(200).end();
  });

  return Promise
    .resolve(nightmare.goto('http://localhost:' + port + '/' + id))
    .then(function () {
      // `deferred` is either undefined (in which case it resolves instantly), or contains the promise
      return deferred;
    })
    .then(function () {
      // Converting the HTML to PDF with nightmare
      log('debug', 'Outputting the html to pdf');
      return nightmare.pdf(output, {marginsType: 2});
    })
    .then(function () {
      // Make our worker available again
      nightmares.unshift(nightmare);

      // Return the location of the document
      return output;
    });
}

// Log some stuff to the console
function log(level, message) {
  console.log("[" + level.toUpperCase() + "]: " + message);
}

// Use bodyParser middleware to parse json responses.
server.use(bodyParser.json());

server.get('/healthcheck', function (req, res) {
  log('info', 'Healthcheck was performed');
  res.end('OK');
});
server.post('/render', function (req, res) {
  log('info', 'Received rendering request');
  queue.add(function started() {
    log('info', 'Started rendering request');
    return render(req.body)
  }).then(function finished(output) {
    log('info', 'Finished rendering request');
    res.sendFile(output, {}, function(err) {
      if ( !err) {
        log('info', 'Sent file successfully');
      }
      fs.unlink(output, function () {
        log('debug', 'Removed local file after serving to the client: ' + output);
      });
    });
  }).catch(function errored(reason) {
    log('error', 'Rendering has encountered an error: ' + reason);
    res.status(500).send(reason);
  });
});

server.listen(port, function () {
  log('info', 'server started');
  log('info', 'port set to: ' + port);
  log('info', 'timeout set to: ' + timeout);
  log('info', 'concurrency set to: ' + concurrency);
});
