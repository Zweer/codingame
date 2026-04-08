const w=+readline(),h=+readline();
const g=[];for(let i=0;i<h;i++) g.push(readline().split(' ').map(Number));
const dx=[-1,-1,-1,0,0,1,1,1],dy=[-1,0,1,-1,1,-1,0,1];
for(let y=0;y<h;y++) for(let x=0;x<w;x++) if(g[y][x]===0){
    let ok=true;
    for(let i=0;i<8;i++){const nx=x+dx[i],ny=y+dy[i];if(nx>=0&&nx<w&&ny>=0&&ny<h){if(g[ny][nx]!==1)ok=false;}}
    if(ok){console.log(x+' '+y);break;}
}
