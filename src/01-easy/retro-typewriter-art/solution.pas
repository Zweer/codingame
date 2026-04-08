{$H+}
program Answer;
uses SysUtils;
var
    line, tok, num, out: string;
    i, j, n, p: integer;
    ch: char;
begin
    readln(line);
    out := '';
    p := 1;
    while p <= Length(line) do begin
        i := Pos(' ', Copy(line, p, Length(line)));
        if i = 0 then begin tok := Copy(line, p, Length(line)); p := Length(line)+1; end
        else begin tok := Copy(line, p, i-1); p := p + i; end;
        if (Length(tok) >= 2) and (Copy(tok, Length(tok)-1, 2) = 'sp') then begin ch := ' '; num := Copy(tok, 1, Length(tok)-2); end
        else if (Length(tok) >= 2) and (Copy(tok, Length(tok)-1, 2) = 'bS') then begin ch := '\'; num := Copy(tok, 1, Length(tok)-2); end
        else if (Length(tok) >= 2) and (Copy(tok, Length(tok)-1, 2) = 'sQ') then begin ch := ''''; num := Copy(tok, 1, Length(tok)-2); end
        else if (Length(tok) >= 2) and (Copy(tok, Length(tok)-1, 2) = 'nl') then begin ch := #10; num := Copy(tok, 1, Length(tok)-2); end
        else begin ch := tok[Length(tok)]; num := Copy(tok, 1, Length(tok)-1); end;
        if num = '' then n := 1 else n := StrToInt(num);
        if n < 1 then n := 1;
        for j := 1 to n do out := out + ch;
    end;
    writeln(out);
    flush(output);
end.
