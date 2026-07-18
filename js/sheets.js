class Sheets{

static async request(action,data={}){

try{

const response=await fetch(CONFIG.APPS_SCRIPT_URL,{
method:"POST",
headers:{
"Content-Type":"text/plain;charset=utf-8"
},
body:JSON.stringify({
action,
token:SessionManager.getToken(),
...data
})
});

if(!response.ok){
return{
success:false,
message:"Server error."
};
}

return await response.json();

}catch{

return{
success:false,
message:"Unable to contact server."
};

}

}

static async login(idToken){

return await this.request("login",{
idToken
});

}

static async validateSession(){

return await this.request("validateSession");

}

static async getUser(){

return await this.request("getUser");

}

static async getRole(){

return await this.request("getRole");

}

static async logout(){

return await this.request("logout");

}

static async log(action,details=""){

return await this.request("log",{
logAction:action,
details
});

}

static async requestAccount(email,name){

return await this.request("requestAccount",{
email,
name
});

}

static async heartbeat(){

return await this.request("heartbeat");

}

}
