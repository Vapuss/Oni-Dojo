const express = require("express");
const fs=require("fs");

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

app.get("/*", function(req,res){
    res.render("pagini"+req.url);

})

function initializeazaErori(){

}
app.listen(8080);
console.log("Serverul a pornit");