const $=id=>document.getElementById(id);
const canvas=$("board"),ctx=canvas.getContext("2d");
let size=20,snake=[],food={},power=null,obstacles=[];
let direction="right",next="right",score=0,level=1,best=+(localStorage.snakeBest||0);
let speed=130,timer=null,running=false,paused=false,theme="neon",sound=true;
$("best").textContent=best;

function show(id){
 ["home","themePanel","settingsPanel","leaderPanel","gamePanel"].forEach(x=>$(x).classList.add("hidden"));
 $(id).classList.remove("hidden");
}
function resize(){
 const rect=canvas.getBoundingClientRect();
 const side=Math.max(240,Math.min(rect.width||420,500));
 canvas.width=side;canvas.height=side;
}
function makeFood(){
 const max=canvas.width/size;
 do{food={x:Math.floor(Math.random()*max),y:Math.floor(Math.random()*max)}}
 while(snake.some(p=>p.x===food.x&&p.y===food.y)||obstacles.some(p=>p.x===food.x&&p.y===food.y));
}
function newGame(){
 resize();size=20;snake=[{x:8,y:8},{x:7,y:8},{x:6,y:8},{x:5,y:8}];
 direction=next="right";score=0;level=1;power=null;obstacles=[];
 speed=+$("difficulty").value;running=true;paused=false;
 $("score").textContent=0;$("level").textContent=1;
 $("over").classList.add("hidden");$("pause").textContent="Ⅱ PAUSE";
 makeFood();draw();clearInterval(timer);timer=setInterval(tick,speed);
 show("gamePanel");$("mobileControls").classList.remove("hidden");
}
function addObstacles(){
 const max=canvas.width/size;
 for(let i=0;i<level+1;i++){
  const p={x:Math.floor(Math.random()*max),y:Math.floor(Math.random()*max)};
  if(!snake.some(s=>s.x===p.x&&s.y===p.y)&&!(p.x===food.x&&p.y===food.y))obstacles.push(p);
 }
}
function draw(){
 ctx.fillStyle=getComputedStyle(document.body).getPropertyValue("--board").trim()||"#0b171b";
 ctx.fillRect(0,0,canvas.width,canvas.height);
 const accent=getComputedStyle(document.body).getPropertyValue("--accent").trim();
 ctx.strokeStyle=accent+"16";
 for(let x=0;x<canvas.width;x+=size){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,canvas.height);ctx.stroke()}
 for(let y=0;y<canvas.height;y+=size){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(canvas.width,y);ctx.stroke()}
 ctx.font="18px Arial";ctx.textAlign="center";
 ctx.fillText("🍎",food.x*size+size/2,food.y*size+size*.85);
 if(power){ctx.fillText(power.type==="shield"?"🛡️":power.type==="speed"?"⚡":"❄️",power.x*size+size/2,power.y*size+size*.85)}
 obstacles.forEach(p=>{ctx.fillStyle="#ef476f";ctx.fillRect(p.x*size+2,p.y*size+2,size-4,size-4)});
 snake.forEach((p,i)=>{
  ctx.shadowBlur=i===0?14:5;ctx.shadowColor=accent;ctx.fillStyle=i===0?accent:"#168f69";
  ctx.beginPath();ctx.roundRect(p.x*size+1,p.y*size+1,size-2,size-2,6);ctx.fill();
 });
 ctx.shadowBlur=0;
}
function tick(){
 if(!running||paused)return;
 direction=next;const h={...snake[0]};
 if(direction==="right")h.x++;if(direction==="left")h.x--;
 if(direction==="up")h.y--;if(direction==="down")h.y++;
 const eating=h.x===food.x&&h.y===food.y;
 const body=eating?snake:snake.slice(0,-1);
 const hit=h.x<0||h.y<0||h.x>=canvas.width/size||h.y>=canvas.height/size||
 body.some(p=>p.x===h.x&&p.y===h.y)||obstacles.some(p=>p.x===h.x&&p.y===h.y);
 if(hit){endGame();return}
 snake.unshift(h);
 if(eating){
  score+=10;$("score").textContent=score;makeFood();
  if(score%50===0&&level<5){level++;$("level").textContent=level;addObstacles();speed=Math.max(65,speed-8);clearInterval(timer);timer=setInterval(tick,speed)}
  if(Math.random()<.35)spawnPower();
 }else snake.pop();
 if(power&&h.x===power.x&&h.y===power.y){
  $("powerInfo").textContent=power.type==="shield"?"🛡️ Shield collected!":power.type==="speed"?"⚡ Speed boost collected!":"❄️ Slow motion collected!";
  if(power.type==="speed"){clearInterval(timer);timer=setInterval(tick,Math.max(55,speed-35))}
  if(power.type==="slow"){clearInterval(timer);timer=setInterval(tick,speed+70)}
  power=null;
 }
 draw();
}
function spawnPower(){
 const types=["shield","speed","slow"],type=types[Math.floor(Math.random()*3)];
 power={x:Math.floor(Math.random()*(canvas.width/size)),y:Math.floor(Math.random()*(canvas.height/size)),type};
}
function endGame(){
 running=false;clearInterval(timer);
 let scores=JSON.parse(localStorage.snakeScores||"[]");
 scores.push(score);scores.sort((a,b)=>b-a);scores=scores.slice(0,10);
 localStorage.snakeScores=JSON.stringify(scores);
 $("finalScore").textContent=score;$("over").classList.remove("hidden");
 if(score>best){best=score;localStorage.snakeBest=best}
}
function startPlay(){newGame()}
function change(d){
 const opposite={up:"down",down:"up",left:"right",right:"left"};
 if(opposite[d]!==direction)next=d;
}
document.addEventListener("keydown",e=>{
 const keys={ArrowUp:"up",ArrowDown:"down",ArrowLeft:"left",ArrowRight:"right"};
 if(keys[e.key]){e.preventDefault();change(keys[e.key])}
 if(e.key===" "&&running)togglePause();
 if(e.key==="Escape"&&running){running=false;clearInterval(timer);show("home")}
});
document.querySelectorAll("[data-dir]").forEach(b=>b.onclick=()=>change(b.dataset.dir));
$("play").onclick=startPlay;$("again").onclick=startPlay;
$("restart").onclick=startPlay;$("overHome").onclick=()=>{running=false;clearInterval(timer);$("mobileControls").classList.add("hidden");show("home")};
$("homeBtn").onclick=()=>{running=false;clearInterval(timer);$("mobileControls").classList.add("hidden");show("home")};
$("themes").onclick=()=>show("themePanel");$("settings").onclick=()=>show("settingsPanel");
$("leaderboard").onclick=()=>{
 const scores=JSON.parse(localStorage.snakeScores||"[]");
 $("scores").innerHTML=scores.length?scores.map((s,i)=>`<li>${s} points</li>`).join(""):"<li>No scores yet. Play a game!</li>";
 show("leaderPanel");
};
document.querySelectorAll(".back").forEach(b=>b.onclick=()=>show("home"));
document.querySelectorAll("[data-theme]").forEach(b=>b.onclick=()=>{
 theme=b.dataset.theme;document.body.classList.remove("cyber","classic");
 if(theme!=="neon")document.body.classList.add(theme);
});
function togglePause(){
 if(!running)return;paused=!paused;$("pause").textContent=paused?"▶ RESUME":"Ⅱ PAUSE";
}
$("pause").onclick=togglePause;
$("sound").onclick=()=>{sound=!sound;$("sound").textContent=sound?"🔊":"🔇"};
$("full").onclick=()=>document.documentElement.requestFullscreen?.();
window.addEventListener("resize",()=>{if(running){resize();draw()}});
show("home");
