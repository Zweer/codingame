const ds=n=>[...String(n)].reduce((s,c)=>s+ +c,0);
const r=+readline();
let found=false;
for(let x=Math.max(1,r-45);x<r;x++)if(x+ds(x)===r){found=true;break;}
console.log(found?"YES":"NO");
