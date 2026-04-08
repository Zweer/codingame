const ds=(n:number):number=>[...String(n)].reduce((s,c)=>s+ +c,0);
let r1=+readline(),r2=+readline();
while(r1!==r2){if(r1<r2)r1+=ds(r1);else r2+=ds(r2);}
console.log(r1);
