const canvas=document.getElementById("board");
const ctx=canvas.getContext("2d");
const $=id=>document.getElementById(id);
let snake,food,dir,next,score=0,best=+(localStorage.snakeBest||0);
let size=24,timer,speed=130,running=false,sound=true;
$("best").textContent=best;

function setup(){
 const r=canvas.getBoundingClientRect();
 canvas.width=r.width; canvas.height=r.height;
 snake=[{x:5,y:8},{x:4,y:8},{x:3,y:8},{x:2,y:8},{x:1,y:8}];
 dir=next="right"; score=0; speed=+$("speed").value;
 $("score").textContent=0;
 placeFood(); draw();
}
function placeFood(){
 const cols=Math.floor(canvas.width/size),rows=Math.floor(canvas.height/size);
 do { food={x:Math.floor(Math.random()*cols),y:Math.floor(Math.random()*rows)}; }
 while(snake.some(p=>p.x===food.x&&p.y===food.y));
}
function draw(){
 ctx.fillStyle="#a2d849";ctx.fillRect(0,0,canvas.width,canvas.height);
 for(let x=0;x<canvas.width;x+=size)for(let y=0;y<canvas.height;y+=size){
  if((Math.floor(x/size)+Math.floor(y/size))%2===0){
   ctx.fillStyle="#addf55";ctx.fillRect(x,y,size,size);
  }
 }
 ctx.font=`${size}px Arial`;ctx.textAlign="center";
 ctx.fillText("🍎",food.x*size+size/2,food.y*size+size*.85);
 snake.forEach((p,i)=>{
  const x=p.x*size,y=p.y*size;
  ctx.fillStyle=i===0?"#4169e8":"#5078ed";
  ctx.beginPath();ctx.roundRect(x+1,y+2,size-3,size-4,10);ctx.fill();
  if(i===0){
   ctx.fillStyle="white";
   ctx.beginPath();ctx.arc(x+size*.65,y+size*.27,5,0,7);ctx.arc(x+size*.65,y+size*.7,5,0,7);ctx.fill();
   ctx.fillStyle="#173caa";
   ctx.beginPath();ctx.arc(x+size*.7,y+size*.27,2,0,7);ctx.arc(x+size*.7,y+size*.7,2,0,7);ctx.fill();
  }
 });
}
function tick(){
 if(!running)return;
 dir=next;
 const h={...snake[0]};
 if(dir==="right")h.x++;if(dir==="left")h.x--;
 if(dir==="up")h.y--;if(dir==="down")h.y++;
 const eating=h.x===food.x&&h.y===food.y;
 const body=eating?snake:snake.slice(0,-1);
 if(h.x<0||h.y<0||h.x>=Math.floor(canvas.width/size)||h.y>=Math.floor(canvas.height/size)||body.some(p=>p.x===h.x&&p.y===h.y)){
  running=false;clearInterval(timer);$("final").textContent=score;$("over").classList.remove("hidden");return;
 }
 snake.unshift(h);
 if(eating){
  score++;$("score").textContent=score;
  if(score>best){best=score;localStorage.snakeBest=best;$("best").textContent=best;}
  placeFood();
  if(score%5===0){speed=Math.max(65,speed-10);clearInterval(timer);timer=setInterval(tick,speed);}
 }else snake.pop();
 draw();
}
function start(){
 $("menu").classList.add("hidden");$("settingsPanel").classList.add("hidden");
 $("over").classList.add("hidden");$("boardWrap").classList.remove("hidden");
 $("mobileControls").classList.remove("hidden");
 setup();running=true;clearInterval(timer);timer=setInterval(tick,speed);
}
function change(d){
 const opposite={up:"down",down:"up",left:"right",right:"left"};
 if(opposite[d]!==dir)next=d;
}
document.addEventListener("keydown",e=>{
 const keys={ArrowUp:"up",ArrowDown:"down",ArrowLeft:"left",ArrowRight:"right"};
 if(keys[e.key]){e.preventDefault();change(keys[e.key]);}
});
document.querySelectorAll("[data-dir]").forEach(b=>b.onclick=()=>change(b.dataset.dir));
$("play").onclick=start;$("daily").onclick=start;$("again").onclick=start;
$("settings").onclick=()=>{$("menu").classList.add("hidden");$("settingsPanel").classList.remove("hidden");};
$("back").onclick=()=>{$("settingsPanel").classList.add("hidden");$("menu").classList.remove("hidden");};
$("home").onclick=$("close").onclick=()=>{
 running=false;clearInterval(timer);$("boardWrap").classList.add("hidden");
 $("mobileControls").classList.add("hidden");$("over").classList.add("hidden");$("menu").classList.remove("hidden");
};
$("full").onclick=()=>{if(!document.fullscreenElement)document.documentElement.requestFullscreen?.();else document.exitFullscreen?.();};
$("sound").onclick=()=>{sound=!sound;$("sound").textContent=sound?"🔊":"🔇";};
window.addEventListener("resize",()=>{if(running){setup();}});
