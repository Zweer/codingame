program Solution;
function ds(n:int64):int64;
var s:int64;
begin s:=0; while n>0 do begin s:=s+n mod 10; n:=n div 10 end; ds:=s end;
var r,x,lo:int64; found:boolean;
begin
  readln(r); found:=false;
  lo:=r-45; if lo<1 then lo:=1;
  for x:=lo to r-1 do if x+ds(x)=r then begin found:=true; break end;
  if found then writeln('YES') else writeln('NO');
end.
