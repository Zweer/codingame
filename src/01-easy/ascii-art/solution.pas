program Solution;
uses SysUtils;
var L,H,i,j,idx:integer; T:string; rows:array[0..29] of string;
begin
  readln(L); readln(H); readln(T); T:=UpperCase(T);
  for i:=0 to H-1 do readln(rows[i]);
  for i:=0 to H-1 do begin
    for j:=1 to Length(T) do begin
      idx:=Ord(T[j])-65;
      if(idx<0)or(idx>25)then idx:=26;
      write(Copy(rows[i],idx*L+1,L));
    end;
    writeln;
  end;
end.
