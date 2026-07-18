class Logger{

static async log(action,details=""){

const token=SessionManager.getToken();

if(!token)return false;

try{

const response=await fetch(CONFIG.APPS_SCRIPT_URL,{
method:"POST",
headers:{
"Content-Type":"text/plain;charset=utf-8"
},
body:JSON.stringify({
action:"log",
token,
logAction:action,
details
})
});

const result=await response.json();

return result.success===true;

}catch{

return false;

}

}

static login(){
return this.log(CONFIG.LOG_ACTIONS.LOGIN,"Success");
}

static logout(){
return this.log(CONFIG.LOG_ACTIONS.LOGOUT,"User logged out");
}

static sessionExpired(){
return this.log(CONFIG.LOG_ACTIONS.SESSION_EXPIRED,"Automatic expiry");
}

static page(page){
return this.log(CONFIG.LOG_ACTIONS.PAGE_VIEW,page);
}

static accountRequest(email){
return this.log(CONFIG.LOG_ACTIONS.ACCOUNT_REQUEST,email);
}

static error(message){
return this.log(CONFIG.LOG_ACTIONS.ERROR,message);
}

}
