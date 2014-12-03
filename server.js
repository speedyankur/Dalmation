#!/bin/env node
//  OpenShift sample Node application
var restify = require('restify');
var mongojs = require("mongojs");

var ip_addr = process.env.OPENSHIFT_NODEJS_IP   || '127.0.0.1';
var port    = process.env.OPENSHIFT_NODEJS_PORT || '8080';

var db_name = process.env.OPENSHIFT_APP_NAME || "dalmationDB";

var connection_string = '127.0.0.1:27017/' + db_name;
// if OPENSHIFT env variables are present, use the available connection info:
if(process.env.OPENSHIFT_MONGODB_DB_PASSWORD){
  connection_string = process.env.OPENSHIFT_MONGODB_DB_USERNAME + ":" +
  process.env.OPENSHIFT_MONGODB_DB_PASSWORD + "@" +
  process.env.OPENSHIFT_MONGODB_DB_HOST + ':' +
  process.env.OPENSHIFT_MONGODB_DB_PORT + '/' +
  process.env.OPENSHIFT_APP_NAME;
}

var db = mongojs(connection_string, [db_name]);
var jobs = db.collection("hotspot");


var server = restify.createServer({
    name : "dalmationServer"
});

server.pre(restify.pre.userAgentConnection());
server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());
server.use(restify.bodyParser());
server.use(restify.CORS());

function findAllHotspots(req, res , next){
    res.setHeader('Access-Control-Allow-Origin','*');
    jobs.find().limit(20).sort({postedOn : -1} , function(err , success){
        console.log('Response success '+success);
        console.log('Response error '+err);
        if(success){
            res.send(200 , success);
            return next();
        }else{
            return next(err);
        }
        
    });
    
}

function findHotspotForProduct(req, res , next){
    res.setHeader('Access-Control-Allow-Origin','*');
    jobs.find({pid:req.params.pid} , function(err , success){
        console.log('Response success '+success);
        console.log('Response error '+err);
        if(success){
            res.send(200 , success);
            return next();
        }
        return next(err);
    })
}

function findProductsForKeywords(req, res , next){
    res.setHeader('Access-Control-Allow-Origin','*');
    jobs.find({keywords:req.params.keyword} , function(err , success){
        var products = []
        for(i=0;i<success.length;i++){
            products.push(success[i].pid);
        }
        console.log('Response success '+products);
        console.log('Response error '+err);
        if(success){
            res.send(200 , products);
            return next();
        }
        return next(err);
    })
}

function postHotspot(req , res , next){
    var hs = {};
    hs.data = req.params.data;
    hs.keywords = req.params.keywords;
    hs.img = req.params.img;
    hs.pid = req.params.pid;
    hs.category = req.params.category;

    res.setHeader('Access-Control-Allow-Origin','*');
    
    jobs.save(hs , function(err , success){
        console.log('Response success '+success);
        console.log('Response error '+err);
        if(success){
            res.send(201 , hs);
            return next();
        }else{
            return next(err);
        }
    });
}

function deleteHotspot(req , res , next){
    res.setHeader('Access-Control-Allow-Origin','*');
    jobs.remove({_id:mongojs.ObjectId(req.params.jobId)} , function(err , success){
        console.log('Response success '+success);
        console.log('Response error '+err);
        if(success){
            res.send(204);
            return next();      
        } else{
            return next(err);
        }
    })
    
}

var PATH = '/hotspot'
server.get({path : PATH , version : '0.0.1'} , findAllHotspots);
server.get({path : PATH +'/product/:pid' , version : '0.0.1'} , findHotspotForProduct);
server.post({path : PATH , version: '0.0.1'} ,postHotspot);
//server.del({path : PATH +'/:jobId' , version: '0.0.1'} ,deleteHotspot);

var PRODUCT_PATH = '/product'
server.get({path : PRODUCT_PATH +'/keyword/:keyword' , version: '0.0.1'} ,findProductsForKeywords);


server.listen(port ,ip_addr, function(){
    console.log('%s listening at %s ', server.name , server.url);
})
