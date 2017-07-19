// server.js

var express = require('express');
var mongo= require('mongodb').MongoClient;
var app = express();

//var liste=[];
var dburl=process.env.DBURL;
// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
//app.set("views",__dirname + '/views/')
app.get("/",function(request,response){
  response.sendFile(__dirname+'/views/index.html')
});
app.get("/new/*", function (request, response) {
  
  var url=request.params[0];
  if(url.match("^http[s]?://[A-Za-z0-9]+\.[A-Za-z0-9]+\.[A-Za-z0-9]+:?[0-9]*$")==null){
    response.send("Invalide url. It should respect the general format http://www.example.com")
  }
  else{
     
    //version 2: using the the database
    mongo.connect(dburl,function(err,db){
      if(err) throw err;
     
      var documents=db.collection("urls");
      //does the database already contain an entry for that url?
      documents.find({"url":url}).toArray(function(err,docs){
        if(err) throw err;
        console.log(docs.length)
        if(docs.length>0){
          
          //response.send(docs);
          response.send({"original":docs[0].url,"shortened":"https://short-urls.glitch.me/"+docs[0].num});
        }
        else{
        var used=true;
        var number=0;
        while(used){
        used=false;
        number=Math.floor(Math.random()*10000);
      
          documents.find({"num":number}).toArray(function(err,doc){
            if(err) throw err;
            if(doc.length>0){
              used=true;
            }
          });
        }
          documents.insert({"num":number,"url":url},function(err,data){
            if(err)throw err;
          });
            response.send({"orginal" : url,"shortened":"https://short-urls.glitch.me/"+number})
        
        }
      });  
      setTimeout(function(){db.close();},5000);
      
    });
  }
  
  
});    
    
    //version 1: using an array variable
    /*
      liste.forEach(function(l){
        if(l.url===url){
          used=true;
          response.send({"orginal" : l.url,"shortened":"https://short-urls.glitch.me/"+l.num});
        }
          
      })
    
    if(!used){
      //generate a random number and check whether it is not aleady used
    used=true;
    var number=0;
    while(used){
      used=false;
      number=Math.floor(Math.random()*10000);
      //version1: checking whether the generated number is already used in the array variable
      liste.forEach(function(l){
        if(l.num==number)
          used=true;
      });
       }
  
  liste.push({"num":number,"url":url});
  response.send({"orginal" : url,"shortened":"https://short-urls.glitch.me/"+number})
    }
    
   */
    

app.get("/:number",function(request,response){
  var sn=+request.params.number;
  var found=false;
  if(!Number.isInteger(sn)){
    response.send("Invalid short url");
  }
  else{
    mongo.connect(dburl,function(err,db){
      db.collection("urls").find({"num":sn}).toArray(function(err,docs){
        if(err)throw err;
        if(docs.length>0)
          response.redirect(docs[0].url);
        else
          response.send("This short url does not exist");
          
      });
      
      db.close();
    })
    
  }
})

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
