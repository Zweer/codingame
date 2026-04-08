{$H+}
program Answer;
var w,h,x,y,i,nx,ny:integer; g:array[0..49,0..49] of integer; ok:boolean;
    dx:array[0..7] of integer=(-1,-1,-1,0,0,1,1,1);
    dy:array[0..7] of integer=(-1,0,1,-1,1,-1,0,1);
begin
    readln(w);readln(h);
    for y:=0 to h-1 do for x:=0 to w-1 do read(g[y][x]);
    for y:=0 to h-1 do for x:=0 to w-1 do if g[y][x]=0 then begin
        ok:=true;
        for i:=0 to 7 do begin nx:=x+dx[i];ny:=y+dy[i];
            if(nx>=0)and(nx<w)and(ny>=0)and(ny<h)and(g[ny][nx]<>1)then ok:=false;end;
        if ok then begin writeln(x,' ',y);halt;end;
    end;
end.
