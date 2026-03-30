program Solution;
{$mode objfpc}{$H+}
uses SysUtils;
var
  n, q, i, dot, sp: longint;
  exts, types: array[0..10000] of string;
  f, ext, line: string;
  found: boolean;
begin
  readln(n);
  readln(q);
  for i := 0 to n-1 do begin
    readln(line);
    sp := Pos(' ', line);
    exts[i] := LowerCase(Copy(line, 1, sp-1));
    types[i] := Copy(line, sp+1, Length(line)-sp);
  end;
  for i := 0 to q-1 do begin
    readln(f);
    dot := 0;
    for sp := Length(f) downto 1 do
      if f[sp] = '.' then begin dot := sp; break; end;
    if dot = 0 then begin writeln('UNKNOWN'); continue; end;
    ext := LowerCase(Copy(f, dot+1, Length(f)-dot));
    found := false;
    for sp := 0 to n-1 do
      if exts[sp] = ext then begin writeln(types[sp]); found := true; break; end;
    if not found then writeln('UNKNOWN');
  end;
end.
