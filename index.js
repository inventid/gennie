var Nightmare  = require('nightmare'),
    Promise    = require('bluebird'),
    Queue      = require('promise-queue'),
    express    = require('express'),
    bodyParser = require('body-parser'),
    uuid       = require('node-uuid'),
    config     = require('./config.json'),
    app        = express();

// Set promise-queue to use
// bluebird's promises.
Queue.configure(Promise);

var nightmare = Nightmare(),
    maxConcurrent = 1,
    maxQueue = Infinity,
    queue = new Queue(maxConcurrent, maxQueue);

// Use bodyParser middleware to
// parse json responses.
app.use(bodyParser.json());

app.post('/render', function(req, res) {
  queue.add(function() {
    return render(req.body)
  }).then(function(output) {
    res.sendFile(output);
  });
});

app.listen(config.port);

function render(data) {
  var id = uuid.v4(),
      output = '/tmp/' + id + '.pdf',
      router = express.Router(),
      deferred;

  app.use('/' + id, router);

  router.use(express.static(config.document_path));
  router.get('/data.json', function(req, res) { res.json(data); });
  router.get('/data', function(req, res) { res.type("text/javascript").send("var data = " + JSON.stringify(data)); });
  router.get('/defer', function(req, res) {
    deferred = new Promise(function(resolve, reject) {
      router.get('/done', function(req, res) {
        resolve();
        res.status(200).end();
      });
    });

    res.status(200).end();
  });

  return Promise
    .resolve(nightmare.goto('http://localhost:' + config.port + '/' + id))
    .then(function() { return deferred; })
    .then(function() { return nightmare.pdf(output, { marginsType: 2 }); })
    .then(function() { return output; });
}
