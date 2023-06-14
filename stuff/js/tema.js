
     tema=localStorage.getItem("tema");
    if(tema){
        document.body.classList.add("emar");
    }
    window.addEventListener("DOMContentLoaded", function(){
        document.getElementById("tema").onclick=function(){
        if (document.body.classList.contains("emar")){
            document.body.classList.remove("emar");
            localStorage.removeItem("tema");
        }
        else{
            document.body.classList.add("emar");
            localStorage.setItem("tema","emar");
        }
        }
    });