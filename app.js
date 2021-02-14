var express = require('express');
const auth = require('./routes/auth');
const passport = require('passport');
const mongoose = require('mongoose');
var routes = require('./routes/index');
var bodyParser = require('body-parser');
var logger = require('morgan');
var cors = require('cors');
const nconf = require('nconf');
const myAuth = require('./anon-passport');


if (process.env.NODE_ENV !== 'production') {
    nconf.env()
    nconf.file('config.json');
    var db_name = nconf.get('MONGO_DB_DEV');
}

require('./passport');

var mongoDB = process.env.MONGODB_URI || db_name;
mongoose.connect(mongoDB, { useNewUrlParser: true , useUnifiedTopology: true });
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

const app = express();

    
// 
app.use(cors());
app.use(logger('dev'));
app.use(bodyParser.json());

app.use('/auth', auth);
app.use(myAuth);
app.use('/', routes);



/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.send(err.message)
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.send(err.message);
});



module.exports = app;
