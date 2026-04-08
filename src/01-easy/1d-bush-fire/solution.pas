{$H+}
program Answer;
var n, i, d, j: integer; s: string;
begin
    readln(n);
    for i := 1 to n do begin
        readln(s); d := 0; j := 1;
        while j <= Length(s) do begin
            if s[j] = 'f' then begin Inc(d); j := j + 3; end else Inc(j);
        end;
        writeln(d); flush(output);
    end;
end.
