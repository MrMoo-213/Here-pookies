class Security{

static async protect(){

const valid=await SessionManager.validate();

if(!valid){

SessionManager.destroy();

window.location.replace(CONFIG.ROUTES.LOGIN);

return false;

}

Logger.page(window.location.pathname);

SessionManager.startWatcher();

return true;

}

static async requireRole(minimumRole){

const response=await fetch(CONFIG.APPS_SCRIPT_URL,{
method:"POST",
headers:{
"Content-Type":"text/plain;charset=utf-8"
},
body:JSON.stringify({
action:"getRole",
token:SessionManager.getToken()
})
});

const result=await response.json();

if(!result.success){

SessionManager.destroy();

window.location.replace(CONFIG.ROUTES.LOGIN);

return false;

}

if(result.role<minimumRole){

window.location.replace(CONFIG.ROUTES.HOME);

return false;

}

return true;

}

static async getUser(){

const response=await fetch(CONFIG.APPS_SCRIPT_URL,{
method:"POST",
headers:{
"Content-Type":"text/plain;charset=utf-8"
},
body:JSON.stringify({
action:"getUser",
token:SessionManager.getToken()
})
});

const result=await response.json();

if(!result.success){

SessionManager.destroy();

window.location.replace(CONFIG.ROUTES.LOGIN);

return null;

}

return result.user;

}

static async isLoggedIn(){

return await SessionManager.validate();

}

static isGuestPage(){

return window.location.pathname===CONFIG.ROUTES.GUEST;

}

static async logout(){

await Logger.logout();

SessionManager.destroy();

window.location.replace(CONFIG.ROUTES.LOGIN);

}

}
