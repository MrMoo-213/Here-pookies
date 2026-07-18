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

static getExpiryTime(now=new Date()){

const current=now.getTime();

for(const time of CONFIG.SESSION.EXPIRY_TIMES){

const expiry=new Date(now);

expiry.setHours(time.hour);
expiry.setMinutes(time.minute);
expiry.setSeconds(0);
expiry.setMilliseconds(0);

if(expiry.getTime()>current){

const maxExpiry=current+CONFIG.SESSION.MAX_DURATION;

return Math.min(expiry.getTime(),maxExpiry);

}

}

return current+CONFIG.SESSION.MAX_DURATION;

}

static createSession(token){

const expires=this.getExpiryTime();

this.setToken(token);

localStorage.setItem("session_expires",expires);

return expires;

}

static getExpiry(){

const expiry=localStorage.getItem("session_expires");

if(!expiry)return 0;

return Number(expiry);

}

static isExpired(){

const expiry=this.getExpiry();

if(!expiry)return true;

return Date.now()>=expiry;

}

static hasSession(){

return !!this.getToken()&&!this.isExpired();

}

static destroy(){

this.clearToken();

localStorage.removeItem("session_expires");

}

static async validate(){

if(!this.hasSession()){

this.destroy();

return false;

}

try{

const response=await fetch(CONFIG.APPS_SCRIPT_URL,{
method:"POST",
headers:{
"Content-Type":"application/json"
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

this.destroy();

return false;

}

}

static startWatcher(){

setInterval(async()=>{

if(this.isExpired()){

this.destroy();

window.location.replace(CONFIG.ROUTES.LOGIN);

return;

}

const valid=await this.validate();

if(!valid){

window.location.replace(CONFIG.ROUTES.LOGIN);

}

},CONFIG.SESSION.CHECK_INTERVAL);

}

}
