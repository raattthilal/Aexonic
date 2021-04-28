const express = require('express');
var cors = require('cors');
const bodyParser = require('body-parser');

const Controller = require('./base/controller.js');
var consoleArguments = require('minimist');
var argv = consoleArguments(process.argv.slice(2));
//Db Connection
var env = process.env.NODE_ENV;
env = env ? env : "development";
console.log("Environment is " + env);
const params = require('./config/params.config');
const dbConfig = require('./config/database.config.js')[env];
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

// create express app
const app = express();
app.use(cors());
// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }))
// parse requests of content-type - application/json
app.use(bodyParser.json());

module.exports = {
    connectToDb: function (callback) {

        mongoose.connect(dbConfig.url, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }).then(() => {
            console.log("Successfully connected to the database");
            if (callback) {
                callback();
            }
        }).catch(err => {
            console.log('Could not connect to the database. Exiting now...', err);
            process.exit();
        });
    },
    methods: {
        loadController: function (controller) {
            var config = params[env] ? params[env] : { jwt: { secret: "yoursecret" } }
            var controllerBaseObj = new Controller(controller, app, config);
            var path = './app/controllers/' + controller + ".controller.js";
            console.log("Loading controller " + path);
            var controller = require(path);
            controller.methods = controllerBaseObj;
            return controller;
        },
        loadModel: function (model, handle) {
            var model = require('./app/models/' + model);
            if (handle) {
                model = model(handle);
            }
            return model;
        }
    },
    start: function (serviceName, routes) {
        var that = this;
        this.connectToDb(function () {

            var port = process.env.port ? process.env.port : null;
            port = port ? port : argv.port ? argv.port : null;
            if (!port) {
                console.log("PORT not set for " + serviceName + " service");

                process.exit(0);
            }
            if (routes) {
                var len = routes.length ? routes.length : 0;
                var i = 0;
                var route = null;
                while (i < len) {
                    route = routes[i];
                    console.log("Loading route " + route);
                    require('./app/routes/' + route + '.routes.js')(app, that.methods);
                    i++;
                }
                app.listen(port, () => {
                    console.log("Server is listening on port " + port);
                });
            }
        });
    }
};