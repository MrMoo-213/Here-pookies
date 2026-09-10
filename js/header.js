document.addEventListener("DOMContentLoaded",()=>{

const header=document.getElementById("header");

if(!header)return;

const path=window.location.pathname.replace(/\/+$/,"");

let title="Here pookies 😘💕";
let showDMs=false;

if(path==="/home/index.html"){
title="Here pookies 😘💕";
}else if(path==="/home/apps/index.html"){
title="Games";
}else if(path==="/home/apps/FNAF.html"){
title="FNAF";
}else if(path==="/home/chat/index.html"){
title="Chat";
showDMs=true;
}

header.innerHTML=`

<header class="topbar">

<div class="title">

<span id="viewTitle">${title}</span>

${showDMs?`<button class="dmToggleButton" id="dmToggleButton">DMs</button>`:""}

</div>

<div class="userArea">

<div class="navMenu" id="navMenu">

<div class="navItems">

<button class="navItem chat" id="navChat" aria-label="Chat">
💬
</button>

<button class="navItem home" id="navHome" aria-label="Home">
🏠
</button>

<button class="navItem competition" id="navCompetition" aria-label="Competitions">
🏆
</button>

<button class="navItem games" id="navGames" aria-label="Games">
🎮
</button>

</div>

<div class="gamesDropdown" id="gamesDropdown">

<div class="gamesList" id="gamesDropdownList"></div>

</div>

</div>

</div>

</header>

`;

document.getElementById("navChat").addEventListener("click",()=>{
window.location.href=CONFIG.ROUTES.CHAT;
});

document.getElementById("navHome").addEventListener("click",()=>{
window.location.href=CONFIG.ROUTES.HOME;
});

document.getElementById("navCompetition").addEventListener("click",()=>{
window.location.href=CONFIG.ROUTES.COMPETITIONS;
});

let gamesLoaded=false;

const gamesDropdown=document.getElementById("gamesDropdown");

function pillClass(game){

if(game.internal===1)return "pill pill-internal";

if(game.internal===2)return "pill pill-safe";

return "pill pill-blue";

}

async function ensureGamesLoaded(){

if(gamesLoaded)return;

const result=await Sheets.getGames();

if(!result.success)return;

gamesLoaded=true;

const list=document.getElementById("gamesDropdownList");

list.innerHTML="";

result.games.forEach(game=>{

const button=document.createElement("button");

button.className=pillClass(game);

button.textContent=game.name;

button.addEventListener("click",(e)=>{

e.stopPropagation();

Sheets.log("GAME_CLICK",game.name);

if(game.internal===1){

window.location.href="/"+game.url.replace(/^\/+/,"");

}else if(game.internal===2){

window.open("/home/apps/safe-search.html?url="+encodeURIComponent(game.url),"_blank");

}else{

window.open(game.url,"_blank");

}

});

list.appendChild(button);

});

}

document.getElementById("navGames").addEventListener("click",()=>{
window.location.href="/home/apps";
});

document.addEventListener("click",()=>{
gamesDropdown.classList.remove("open");
});

});
