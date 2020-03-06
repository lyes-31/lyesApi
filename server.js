// Imports
var express     = require('express');
const adminRouter =  require('./adminRouter')

var bodyParser  = require('body-parser');

var apiRouter   = require('./apiRouter').router;
const port = process.env.PORT || 8060;



// Instantiate server
var server = express();

server.use(express.static('public'));


// Body Parser configuration
server.use(bodyParser.urlencoded({ extended: true }));
server.use(bodyParser.json());

// Configure routes
server.get('/', function (req, res) {
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send('<h1>Bonjour sur mon super server</h1>');
});


// Utilisation de notre routeur 
server.use('/api/', apiRouter);
server.use('/admin/', adminRouter);




// Launch server
server.listen(8060, function() {
    console.log('Server en écoute sur le port : ',port);
});