kola("kola.testsuit.Engine",[
    "kola.html.Element",
    "kola.lang.Class"
],function($,KolaClass){

    var exports=KolaClass.create({
        _init:function(){
            this.cases=[];
        },
        addCase:function(newCase){
            this.cases.push(newCase);
        },
        runAll:function(){
            var results=[];
            for(var i=0;i<this.cases.length;i++){
                var iframe=$("<iframe></iframe>");
                try{
                    this.currentCase=i;
                    this.cases[i].test();
                    results.push("<<"+this.cases[this.currentCase].name+">> passed");
                }catch(ex){
                    results.push(ex.message)
                }
                iframe.remove();
            }
            console.log(results);
        },assert:function(org,dest,message){
            if(org==dest){
            }else{
                throw new Error("<<"+this.cases[this.currentCase].name+">> Error:"+(message||"Assert Fail"));
            }
        }
    });
    
    return exports;
})