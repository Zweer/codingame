{$H+}
program Answer;
var
    n, i, v, r: integer;
begin
    readln(n);
    if n = 0 then begin writeln(0); halt; end;
    r := 99999;
    for i := 1 to n do
    begin
        read(v);
        if (abs(v) < abs(r)) or ((abs(v) = abs(r)) and (v > 0)) then r := v;
    end;
    writeln(r);
    flush(output);
end.
