const express = require("express");
const fs=require("fs");
obGlobal={
    obErori:null,
    obImagini:null
}
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
    console.log(req.url);
    res.render("pagini"+req.url, function(err, rezRandare){
        if(err){
            console.log(err);
            if(err.message.startsWith("Failed to lookup view"))
            {
                afiseazaEroare(res, 404);
            }
            else
            {
                afiseazaEroare(res);
            }
        }
        else{
            console.log(rezRandare);
            res.send(rezRandare);
        }
    });
    

})

function initializeazaErori(){
    var continut=fs.readFileSync(__dirname+"/stuff/json/erori.json").toString("utf-8");
    console.log(continut);
    obGlobal.obErori=JSON.parse(continut);
    let vErori=obGlobal.obErori.info_erori;
    //for(let i=0;i<vErori.length;i++)//vErori[i]
    for(let eroare of vErori){
        eroare.imagine="/" + obGlobal.obErori.cale_baza + "/" + eroare.imagine;
    }
}
initializeazaErori()

function afiseazaEroare(res, _identificator, _titlu, _text, _imagine){
    let vErori=obGlobal.obErori.info_erori;
    let eroare=vErori.find(function(elem){return elem.identificator == _identificator});
    if(eroare){
        let titlu=_titlu || eroare.titlu;
        let text=_text || eroare.text;
        let imagine=_imagine || eroare.imagine;
        if(eroare.status)
            res.status(eroare.identificator).render("pagini/eroare",{titlu:eroare.titlu, text:eroare.text, imagine:eroare.imagine});
        else
            res.render("pagini/eroare",{titlu:eroare.titlu, text:eroare.text, imagine:eroare.imagine1});
    }
    else
        {
            var errDef=obGlobal.obErori.eroare_default;
            res.render("pagini/eroare",{titlu:errDef.titlu, text:errDef.text, imagine:errDef.imagine});
    }
        
}


app.listen(8080);
console.log("Serverul a pornit");