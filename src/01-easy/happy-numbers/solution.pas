program Answer;
uses SysUtils;
function dss(n: integer): integer;
var d: integer;
begin
    dss := 0;
    while n > 0 do begin d := n mod 10; dss := dss + d*d; n := n div 10; end;
end;
var n, i, j, x, cnt: integer; s: string;
    cur: integer; seen: array[0..9999] of integer; found: boolean;
begin
    readln(n);
    for i := 1 to n do begin
        readln(s); s := Trim(s);
        x := 0;
        for j := 1 to Length(s) do x := x + (Ord(s[j])-48)*(Ord(s[j])-48);
        cnt := 0; found := false;
        cur := x;
        while (cur <> 1) and (not found) do begin
            for j := 0 to cnt-1 do if seen[j] = cur then begin found := true; break; end;
            if not found then begin seen[cnt] := cur; Inc(cnt); cur := dss(cur); end;
        end;
        if cur = 1 then writeln(s, ' :)')
        else writeln(s, ' :(');
    end;
end.