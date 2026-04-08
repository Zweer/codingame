program Solution;
function ds(n:int64):int64;
var s:int64;
begin s:=0; while n>0 do begin s:=s+n mod 10; n:=n div 10 end; ds:=s end;
var r1,r2:int64;
begin
  readln(r1); readln(r2);
  while r1<>r2 do
    if r1<r2 then r1:=r1+ds(r1) else r2:=r2+ds(r2);
  writeln(r1);
end.
