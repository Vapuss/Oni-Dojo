const express = require("express");

app= express();
console.log("Folder proiect", __dirname);

app.set("view engine","ejs");

app.use("/stuff",express.static(__dirname+"/stuff")); //scapam de 7000 de app.geturi

app.get("/ceva", function(req, res){
    res.send("altceva");
})

app.get(["/index","/","/home"], function(req, res){
    res.render("pagini/index");
})

app.get(["/despre"], function(req, res){
    res.render("pagini/despre");
})

app.listen(8080);
console.log("Serverul a pornit");