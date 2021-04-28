const { methods } = require('../server');

module.exports = function(name,app,config) {
      
    const jwt = require('jsonwebtoken');
    this.options = {auth:true};
    var that = this;
    this.actionsWithoutAuth = [];
    this.get = function(path,fn,options,routeParams) {
        this.registerRoute('get',path,fn,options,routeParams);
    };
    this.post = function(path,fn,options,routeParams) {
        this.registerRoute('post',path,fn,options,routeParams);
    };
    this.put = function(path,fn,options,routeParams) {
        this.registerRoute('put',path,fn,options,routeParams);
    };
    this.delete = function(path,fn,options,routeParams) {
        this.registerRoute('delete',path,fn,options,routeParams);
    };
    this.registerRoute = function() {
        var argCount = arguments.length;
        var method = arguments[0];
        if(!method) {
            console.log("Argument missing for register route. Pass method as first argument. Method is missing");
            return;
        } 
        var path = arguments[1]; 

        if(!path) {
            console.log("Argument missing for register route. Pass path as first argument. Path is missing");
            return;
        }

        var fn = arguments[2];

        var options = arguments[3];
        var routeParams = arguments[4];
        
        console.log("Registering route "+method.toUpperCase()+" "+path+" with options "+JSON.stringify(options));
        if(!fn) {
            console.log("Unable to register route "+method.toUpperCase()+" "+path+", callback function is undefined...");
            return;
        }
        var methods = ["get","post","put","patch","delete","head"];
        if(methods.indexOf(method) == -1) {
            console.log("Invalid method "+method+" passed to registerRoute. Available methods are "+methods);
            return;
        }
        options = options?options:this.options;
        console.log("Options received: "+JSON.stringify(options));

        var path = options.useAbsolutePath?path:"/"+name+`/${path}`;
        if(!options.auth) {
            console.log("Authorization not needed");
            this.actionsWithoutAuth[method] = !this.actionsWithoutAuth[method]?[]:this.actionsWithoutAuth[method];
            this.actionsWithoutAuth[method].push(path);
            console.log(this.actionsWithoutAuth);
        }
        console.log("Path is "+path);
        var rpJson = routeParams?JSON.stringify(routeParams):"";
        if(!routeParams) {
            console.log(`app.${method}('${path}',fn)`);
            app[method](path,fn);
        }
        else {
            console.log(`app.${method}('${path}',${rpJson},fn)`);
            app[method](path,routeParams,fn);
        }

    };

    
    app.use(function(req, res, next){
        var path = req.path;
        //path = path[path.length-1];
        if(!path) {
            console.log("Invalid path");
            return;
        }
        console.log("path is "+ path);
        var method =  req.method.toLowerCase();
        console.log("authWithout array"+ that.actionsWithoutAuth);
        console.log("method"+ method)
        var noAuthActions  =  that.actionsWithoutAuth[method]?that.actionsWithoutAuth[method]:[];
        console.log(noAuthActions);
        if(noAuthActions.indexOf(path) != -1) {
            console.log("Path does not require authorization...");
            next.call();
            return;
        }
        const bearerHeader = req.headers['authorization'];
        var bearer = null;
        var token = null;
        if (typeof bearerHeader == 'undefined' || !(bearer = bearerHeader.trim().split(' ')) || !(token = bearer[1])) {
            res.sendStatus(401);
            return;
        }
        //console.log(bearer);
        // console.log("JWT token received is "+token);
      //  console.log("JWT secret received is "+config.jwt.secret);
        jwt.verify(token, config.jwt.secret, (err, authData) => {        
            if (err) {
                console.log("Invalid JWT token");
                res.status(401).send({
                    success:false,
                    message:"Unauthorized..!  Error: 401 ",
                    error:err
                });
            } else {
                // console.log(JSON.stringify(authData));
                req.identity = authData;
                console.log("Token verified..");
                return next.call();
            }
        });
    });

};  