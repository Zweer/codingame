{$H+}
program Answer;
uses SysUtils;
function dss(n: integer): integer;
var d: integer;
begin
    result := 0;
    while n > 0 do begin d := n mod 10; result := result + d*d; n := n div 10; end;
end;
function isHappy(start: integer): boolean;
var x, j, cnt: integer; seen: array[0..9999] of integer; found: boolean;
begin
    x := start; cnt := 0;
    while x <> 1 do begin
        found := false;
        for j := 0 to cnt-1 do if seen[j] = x then begin found := true; break; end;
        if found then begin result := false; exit; end;
        seen[cnt] := x; Inc(cnt); x := dss(x);
    end;
    result := true;
end;
var n, i, j, x: integer; s: string;
begin
    readln(n);
    for i := 1 to n do begin
        readln(s); s := Trim(s);
        x := 0;
        for j := 1 to Length(s) do x := x + (Ord(s[j])-48)*(Ord(s[j])-48);
        if isHappy(x) then writeln(s, ' :)')
        else writeln(s, ' :(');
    end;
end.