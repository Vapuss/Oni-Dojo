const express = require("express");
const fs=require("fs");
const path=require('path');
const sharp=require('sharp');
const sass=require('sass');
const ejs=require('ejs');
const {Client}=require('pg');
const AccesBD= require("./module_proprii/accesbd.js");
 
AccesBD.getInstanta().select(
    {tabel:"prajituri",
    campuri:["nume", "pret", "calorii"],
    conditiiAnd:["pret>7"]},
    function (err, rez){
        console.log(err);
        console.log(rez);
    }
)

var client= new Client({database:"pavelz",
        user:"jakez",
        password:"parola",
        host:"localhost",
        port:5432});
client.connect();
client.query("select * from lab8_16", function(err, rez){
    console.log("eroare:",err);
    console.log("rezultat:",rez);
} )



obGlobal={
    obErori:null,
    obImagini:null,
    folderScss:path.join(__dirname,"stuff/scss"),
    folderCss:path.join(__dirname,"stuff/css"),
    folderBackup:path.join(__dirname,"backup"),
    optiuniMeniu:[]
}


client.query("select * from unnest(enum_range(null::tipuri_produse))", function(err, rezCategorie){
    if(err)
       { console.log(err);}
    else
    {
        obGlobal.optiuniMeniu=rezCategorie.rows;
    }});
app= express();
console.log("Folder proiect", __dirname);
console.log("Cale fisier", __filename);
console.log("Director de lucru",process.cwd());

vectorFoldere=["temp","temp1","backup"];
for(let folder of vectorFoldere){
    //let caleFolder=__dirname + "/" + folder;
    let caleFolder=path.join(__dirname,folder); 
    if(!fs.existsSync(caleFolder)){
        fs.mkdirSync(caleFolder);
    }
} 

function compileazaScss(caleScss, caleCss){
    if(!caleCss)
 {   //let vectorCale=caleScss.split("\\")
    //let numeFisExt=vectorCale[vectorCale.length-1];
    let numeFisExt=path.basename(caleScss);
    let numeFis=numeFisExt.split(".")[0];
    caleCss=numeFis+".css";
}
    if (!path.isAbsolute(caleScss))
        caleScss=path.join(obGlobal.folderScss,caleScss)
    if (!path.isAbsolute(caleCss))
        caleCss=path.join(obGlobal.folderCss,caleCss)

    let caleBackup=path.join(obGlobal.folderBackup, "stuff/css");
    if(!fs.existsSync(caleBackup)){
        fs.mkdirSync(caleBackup,{recursive:true})
    }


   // let vectorCale=caleCss.split("\\");
   // let numeFisCss=vectorCale[vectorCale.length-1];
   let numeFisCss=path.basename(caleCss);
    if (fs.existsSync(caleCss))
       { 
        fs.copyFileSync(caleCss,path.join(obGlobal.folderBackup, "stuff/css",numeFisCss))
    }
    rez=sass.compile(caleScss, {"sourceMap":true});
    fs.writeFileSync(caleCss,rez.css)
    console.log("Compilare scss:",rez);
}
//compileazaScss("a.scss");

vFisiere=fs.readdirSync(obGlobal.folderScss);
//console.log(vFisiere);
for(let numeFis of vFisiere){
    if(path.extname(numeFis)==".scss"){
        compileazaScss(numeFis);
    }
}

fs.watch(obGlobal.folderScss,function(eveniment, numeFis){
    console.log(eveniment, numeFis);
    if(eveniment=="change"||eveniment=="rename"){
        let CaleCompleta=path.join(obGlobal.folderScss, numeFis);
        if(fs.existsSync(CaleCompleta)){
            compileazaScss(CaleCompleta);
        }
    }
})

app.set("view engine","ejs");

app.use("/stuff",express.static(__dirname+"/stuff")); //scapam de 7000 de app.geturi
app.use("/node_modules",express.static(__dirname+"/node_modules"));


app.use("/*", function(req, res, next){
    res.locals.optiuniMeniu=obGlobal.optiuniMeniu;
    next();
})

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
    res.render("pagini/index",{ip: req.ip, imagini:obGlobal.obImagini.imagini});    

})

app.get("/produse",function(req, res){


    //TO DO query pentru a selecta toate produsele
    //TO DO se adauaga filtrarea dupa tipul produsului
    //TO DO se selecteaza si toate valorile din enum-ul categ_prajitura
    client.query("select * from unnest(enum_range(null::categ_prajitura))", function(err, rezCategorie){
        if(err)
           { console.log(err);}
        else
        {
            let conditieWhere="";
            if(req.query.tip)
                  conditieWhere=` where tip_produs='${req.query.tip}'`
            client.query("select * from prajituri"+ conditieWhere , function( err, rez){
                console.log(300)
                if(err){
                    console.log(err);
                    afiseazaEroare(res, 2);
                }
                else
                    console.log(rez);
                    res.render("pagini/produse", {produse:rez.rows, optiuni:rezCategorie.rows});
            });
        }
    
    })
    
       


});


app.get("/produs/:id",function(req, res){
    console.log(req.params);
   
    client.query(`select * from prajituri where id=${req.params.id} `, function( err, rezultat){
        if(err){
            console.log(err);
            afiseazaEroare(res, 2);
        }
        else
            res.render("pagini/produs", {prod:rezultat.rows[0]});
    });
});


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

function initializeazaImagini(){
    var continut=fs.readFileSync(__dirname+"/stuff/json/galerie.json").toString("utf-8");
    
    obGlobal.obImagini=JSON.parse(continut);
    let vImagini=obGlobal.obImagini.imagini;

    let caleAbs=path.join(__dirname, obGlobal.obImagini.cale_galerie);
    let caleAbsMediu=path.join(__dirname, obGlobal.obImagini.cale_galerie, "mediu");
    if (!fs.existsSync(caleAbsMediu))
        fs.mkdirSync(caleAbsMediu);

    //for(let i=0;i<vErori.length;i++)//vErori[i]
    for(let imag of vImagini){
        [numeFis, ext]=imag.fisier.split(".");
        let caleFisAbs=path.join(caleAbs, imag.fisier);
        let caleFisMediuAbs=path.join(caleAbsMediu, numeFis+ ".webp")
        sharp(caleFisAbs).resize(400).toFile(caleFisMediuAbs);
        imag.fisier_mediu=path.join("/", obGlobal.obImagini.cale_galerie,"mediu", numeFis+".webp");
        imag.fisier=path.join("/", obGlobal.obImagini.cale_galerie,imag.fisier);

        //eroare.imagine="/" + obGlobal.obErori.cale_baza + "/" + eroare.imagine;
    }
}
initializeazaImagini()




//////////////////////////


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