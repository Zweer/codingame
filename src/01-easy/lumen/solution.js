const n=+readline(),l=+readline();
const g=[];for(let i=0;i<n;i++) g.push(readline().split(' '));
let dark=0;
for(let r=0;r<n;r++) for(let c=0;c<n;c++){
    let lit=false;
    for(let r2=0;r2<n&&!lit;r2++) for(let c2=0;c2<n&&!lit;c2++)
        if(g[r2][c2]==='C'&&Math.max(Math.abs(r-r2),Math.abs(c-c2))<l) lit=true;
    if(!lit) dark++;
}
console.log(dark);
