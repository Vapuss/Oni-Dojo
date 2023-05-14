const express = require("express");
const fs=require("fs");
const path=require('path');

obGlobal={
    obErori:null,
    obImagini:null
}
app= express();
console.log("Folder proiect", __dirname);
console.log("Cale fisier", __filename);
console.log("Director de lucru",process.cwd);

vectorFoldere=["temp","temp1"];
for(let folder of vectorFoldere){
    //let caleFolder=__dirname + "/" + folder;
    let caleFolder=path.join(__dirname,folder); 
    if(!fs.existsSync(caleFolder)){
        fs.mkdirSync(caleFolder);
    }
} 

app.set("view engine","ejs");

app.use("/stuff",express.static(__dirname+"/stuff")); //scapam de 7000 de app.geturi

app.use(/^\/stuff(\/[a-zA-Z0-9]*)*$/,function(req, res){
    afiseazaEroare(res,403);
})

app.get("/favicon.ico" , function(req, res){
    res.sendFile(__dirname+"/stuff/ico/favicon.ico");
})

app.get("/ceva", function(req, res){
    res.send("altceva");
})

app.get(["/index","/","/home"], function(req, res){
    res.render("pagini/index");
})

app.get("/*.ejs", function(req, res){
    afiseazaEroare(res, 400);
})

app.get("/*", function(req,res){
    try
    {
    console.log(req.url);
    res.render("pagini"+req.url, function(err, rezRandare){
        if(err){
            console.log(err);
            if(err.message.startsWith("Failed to lookup view"))
            {
                //afiseazaEroare(res, {_identificator:404, _titlu:"bau"});
                afiseazaEroare(res, 404, "bau");
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
    });}
    catch(err){
        if(err.message.startsWith("Cannot find module"))
            {
                //afiseazaEroare(res, {_identificator:404, _titlu:"bau"});
                afiseazaEroare(res, 404, "bau");
            }
            else
            {
                afiseazaEroare(res);
            }
    }
    

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
/*daca  programatorul seteaza titlul, se ia titlul din argument
daca nu e setat, se ia cel din json
daca nu avem titluk nici in JSOn se ia titlul de valoarea default
idem pentru celelalte*/
function afiseazaEroare(res, _identificator, _titlu="titlu default", _text, _imagine){
    let vErori=obGlobal.obErori.info_erori;
    let eroare=vErori.find(function(elem){return elem.identificator == _identificator});
    if(eroare){
        let titlu1=_titlu=="titlu default" ? (eroare.titlu || _titlu) : _titlu;
        let text1=_text || eroare.text;
        let imagine1=_imagine || eroare.imagine;
        if(eroare.status)
            res.status(eroare.identificator).render("pagini/eroare",{titlu:titlu1, text:text1, imagine:imagine1});
        else
            res.render("pagini/eroare",{titlu:titlu1, text:text1, imagine:imagine1});
    }
    else
        {
            var errDef=obGlobal.obErori.eroare_default;
            res.render("pagini/eroare",{titlu:errDef.titlu, text:errDef.text, imagine:obGlobal.obErori.cale_baza + "/" +errDef.imagine});
    }
        
}


app.listen(8080);
console.log("Serverul a pornit");