document.addEventListener("DOMContentLoaded",()=>{
const header=document.getElementById("header");
if(!header)return;

header.innerHTML=`
<header class="topbar">
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

document.getElementById("navChat").onclick=()=>window.location.href="/home/chat";
document.getElementById("navHome").onclick=()=>window.location.href="/home";
document.getElementById("navCompetition").onclick=()=>window.location.href="/home/competitions";
document.getElementById("navGames").onclick=()=>window.location.href="/home/apps";

const gamesDropdown=document.getElementById("gamesDropdown");

document.getElementById("navGames").addEventListener("click",e=>{
e.stopPropagation();
gamesDropdown.classList.toggle("show");
});

document.addEventListener("click",()=>{
gamesDropdown.classList.remove("show");
});
});
