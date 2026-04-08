{$H+}
program Answer;
uses SysUtils;
function dss(n: integer): integer;
var d: integer;
begin
    result := 0;
    while n > 0 do begin d := n mod 10; result := result + d*d; n := n div 10; end;
end;
var
    n, i, x, j: integer;
    s: string;
    seen: array[0..999] of integer;
    cnt: integer;
    found: boolean;
begin
    readln(n);
    for i := 1 to n do begin
        readln(s);
        s := Trim(s);
        x := 0;
        for j := 1 to Length(s) do x := x + (Ord(s[j])-48)*(Ord(s[j])-48);
        cnt := 0;
        found := false;
        while (x <> 1) and (not found) do begin
            for j := 0 to cnt-1 do if seen[j] = x then begin found := true; break; end;
            if not found then begin seen[cnt] := x; Inc(cnt); x := dss(x); end;
        end;
        if x = 1 then writeln(s, ' :)')
        else writeln(s, ' :(');
        flush(output);
    end;
end.
