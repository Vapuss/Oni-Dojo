const express = require("express");

app= express();
console.log("Folder proiect", __dirname);

app.set("view engine","ejs");

app.use("/stuff",express.static(__dirname+"/stuff")); //scapam de 7000 de app.geturi

app.get("/ceva", function(req, res){
    res.send("altceva");
})

app.get("/index", function(req, res){
    res.render("pagini/index");
})

app.listen(8080);
console.log("Serverul a pornit");