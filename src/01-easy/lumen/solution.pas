{$H+}
program Answer;
uses SysUtils, Math;
var n,l,r,c,r2,c2,d:integer; g:array[0..49] of array of string;
    parts:array of string;
begin
    readln(n);readln(l);
    for r:=0 to n-1 do begin
        SetLength(g[r],n);
        SetLength(parts,0);
        var line:string; readln(line);
        var p:integer:=1; var idx:integer:=0;
        while p<=Length(line) do begin
            var e:integer:=p;
            while(e<=Length(line))and(line[e]<>' ')do Inc(e);
            if idx<n then g[r][idx]:=Copy(line,p,e-p);
            Inc(idx); p:=e+1;
        end;
    end;
    d:=0;
    for r:=0 to n-1 do for c:=0 to n-1 do begin
        var lit:boolean:=false;
        for r2:=0 to n-1 do for c2:=0 to n-1 do
            if(g[r2][c2]='C')and(Max(Abs(r-r2),Abs(c-c2))<l)then lit:=true;
        if not lit then Inc(d);
    end;
    writeln(d);flush(output);
end.
