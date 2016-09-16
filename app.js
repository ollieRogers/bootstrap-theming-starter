// set up a simple http server to serve static files

var express          = require('express'),
    app              = express();



// new relic for production
if (process.env.NODE_ENV === 'production' && !process.env.UAT)
    require('newrelic');



// location for static files
app.use(express.static(__dirname + '/dist'));



// catch 404 and forward to error handler
app.use(function (req, res, next) {
    res.status(404);
    res.redirect('/404/');
});



// set port
app.set('port', process.env.PORT || 3000);



/*
 * Start server
 */
app.listen(app.get('port'), function () {
    console.log("running", app.settings.env);
});
