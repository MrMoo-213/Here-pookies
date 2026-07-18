class Auth{

static initialise(){

google.accounts.id.initialize({
client_id:CONFIG.CLIENT_ID,
callback:this.googleCallback.bind(this),
auto_select:false,
cancel_on_tap_outside:true
});

const button=document.getElementById("googleButton");

if(button){

google.accounts.id.renderButton(button,{
type:"standard",
theme:"outline",
size:"large",
shape:"pill",
text:"signin_with",
width:320,
logo_alignment:"left"
});

}

}

static async googleCallback(response){

try{

const result=await Sheets.login(response.credential);

if(!result.success){

this.showError(result.message||CONFIG.ERRORS.ACCOUNT_NOT_FOUND);

return;

}

SessionManager.createSession(result.token);

await Logger.login();

window.location.replace(CONFIG.ROUTES.HOME);

}catch{

this.showError("Unable to sign in.");

}

}

static async autoLogin(){

if(!SessionManager.hasSession())return;

const valid=await SessionManager.validate();

if(valid){

window.location.replace(CONFIG.ROUTES.HOME);

}else{

SessionManager.destroy();

}

}

static async logout(){

try{

await Sheets.logout();

}catch{}

await Logger.logout();

SessionManager.destroy();

google.accounts.id.disableAutoSelect();

window.location.replace(CONFIG.ROUTES.LOGIN);

}

static showError(message){

const box=document.getElementById("error");

if(!box){

alert(message);

return;

}

box.textContent=message;

box.classList.add("show");

setTimeout(()=>{

box.classList.remove("show");

},4000);

}

static hideError(){

const box=document.getElementById("error");

if(!box)return;

box.classList.remove("show");

}

}
