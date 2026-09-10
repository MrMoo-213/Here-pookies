document.addEventListener("DOMContentLoaded",()=>{
const header=document.getElementById("header");
if(!header)return;



let title="Here pookies 😘💕";

header.innerHTML=`
<header class="topbar">
<div class="title">${title}</div>
<div class="userArea">
<div class="navMenu" id="navMenu">
<div class="navItems">
<button class="navItem chat" id="navChat" aria-label="Chat">💬</button>
<button class="navItem home" id="navHome" aria-label="Home">🏠</button>
<button class="navItem competition" id="navCompetition" aria-label="Competitions">🏆</button>
<button class="navItem games" id="navGames" aria-label="Games">🎮</button>
</div>
<div class="gamesDropdown" id="gamesDropdown">
<div class="gamesList" id="gamesDropdownList"></div>
</div>
</div>
</div>
</header>
`;

const navChat=document.getElementById("navChat");
const navHome=document.getElementById("navHome");
const navCompetition=document.getElementById("navCompetition");
const navGames=document.getElementById("navGames");

if(navChat)navChat.onclick=()=>window.location.href="/home/chat";
if(navHome)navHome.onclick=()=>window.location.href="/home";
if(navCompetition)navCompetition.onclick=()=>window.location.href="/home/competitions";
if(navGames)navGames.onclick=()=>window.location.href="/home/apps";

const gamesDropdown=document.getElementById("gamesDropdown");

if(navGames&&gamesDropdown){
navGames.addEventListener("click",e=>{
e.stopPropagation();
gamesDropdown.classList.toggle("show");
});
}

document.addEventListener("click",()=>{
if(gamesDropdown)gamesDropdown.classList.remove("show");
});
});
