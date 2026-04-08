{$H+}
program Solution;
uses SysUtils;
var L,H,i,j,idx,need:integer; T:string; rows:array[0..29] of string;
begin
  readln(L); readln(H); readln(T); T:=UpperCase(T);
  need:=27*L;
  for i:=0 to H-1 do begin readln(rows[i]); while Length(rows[i])<need do rows[i]:=rows[i]+' '; end;
  for i:=0 to H-1 do begin
    for j:=1 to Length(T) do begin
      idx:=Ord(T[j])-65;
      if(idx<0)or(idx>25)then idx:=26;
      write(Copy(rows[i],idx*L+1,L));
    end;
    writeln;
  end;
end.
