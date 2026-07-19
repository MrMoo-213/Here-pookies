document.addEventListener("DOMContentLoaded",async()=>{

Auth.initialise();

const guestButton=document.getElementById("guestButton");

if(guestButton){

guestButton.addEventListener("click",()=>{

window.location.href=CONFIG.ROUTES.GUEST;

});

}

const createButton=document.getElementById("createButton");

if(createButton){

createButton.addEventListener("click",()=>{

window.location.href=CONFIG.ROUTES.CREATE;

});

}

await Auth.autoLogin();

const loading=document.getElementById("loading");

if(loading){

loading.classList.add("hidden");

}

});

window.addEventListener("pageshow",()=>{

const error=document.getElementById("error");

if(error){

error.classList.remove("show");

error.textContent="";

}

});

document.addEventListener("keydown",e=>{

if(e.key!=="Enter")return;

const button=document.querySelector("#googleButton div");

if(button){

button.click();

}

});

window.addEventListener("unhandledrejection",()=>{

Auth.showError("An unexpected error occurred.");

});

window.addEventListener("error",()=>{

Auth.showError("An unexpected error occurred.");

});
