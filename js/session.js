class SessionManager{

static getToken(){
return localStorage.getItem(CONFIG.SESSION.TOKEN_NAME);
}

static setToken(token){
localStorage.setItem(CONFIG.SESSION.TOKEN_NAME,token);
}

static clearToken(){
localStorage.removeItem(CONFIG.SESSION.TOKEN_NAME);
}

static createSession(token){

this.setToken(token);

}

static hasSession(){

return !!this.getToken();

}

static destroy(){

this.clearToken();

}

static async validate(){

if(!this.hasSession()){

return false;

}

try{

const response=await fetch(CONFIG.APPS_SCRIPT_URL,{
method:"POST",
headers:{
"Content-Type":"text/plain;charset=utf-8"
},
body:JSON.stringify({
action:"validateSession",
token:this.getToken()
})
});

const result=await response.json();

if(!result.success){

this.destroy();

return false;

}

return true;

}catch{

return true;

}

}

static startWatcher(){

setInterval(async()=>{

const valid=await this.validate();

if(!valid){

window.location.replace(CONFIG.ROUTES.LOGIN);

}

},CONFIG.SESSION.CHECK_INTERVAL);

}

}
