program Answer;
uses SysUtils, Math;
var n,l,r,c,r2,c2,d,idx:integer;
    g:array[0..49,0..49] of char;
    line:string;
    lit:boolean;
begin
    readln(n);readln(l);
    for r:=0 to n-1 do begin
        readln(line); line:=Trim(line); idx:=0;
        for c:=0 to n-1 do begin
            while (idx<Length(line)) and (line[idx+1]=' ') do Inc(idx);
            g[r,c]:=line[idx+1]; Inc(idx,2);
        end;
    end;
    d:=0;
    for r:=0 to n-1 do for c:=0 to n-1 do begin
        lit:=false;
        for r2:=0 to n-1 do for c2:=0 to n-1 do
            if(g[r2,c2]='C')and(Max(Abs(r-r2),Abs(c-c2))<l)then lit:=true;
        if not lit then Inc(d);
    end;
    writeln(d);
end.