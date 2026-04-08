const L=+readline(),H=+readline(),T=readline().toUpperCase();
const rows=[];for(let i=0;i<H;i++)rows.push(readline());
for(let i=0;i<H;i++){
    let line='';
    for(const c of T){let idx=c.charCodeAt(0)-65;if(idx<0||idx>25)idx=26;line+=rows[i].substr(idx*L,L);}
    console.log(line);
}
