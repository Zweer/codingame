program Unary;
var
  msg: string;
  bin: array[1..1400] of char;
  blen, i, j, count, n: integer;
  cur: char;
  first: boolean;
begin
  readln(msg);
  blen := 0;
  for i := 1 to Length(msg) do begin
    n := Ord(msg[i]);
    for j := 6 downto 0 do begin
      inc(blen);
      if (n shr j) and 1 = 1 then bin[blen] := '1'
      else bin[blen] := '0';
    end;
  end;
  i := 1;
  first := true;
  while i <= blen do begin
    cur := bin[i];
    count := 0;
    while (i <= blen) and (bin[i] = cur) do begin inc(count); inc(i); end;
    if not first then write(' ');
    first := false;
    if cur = '1' then write('0') else write('00');
    write(' ');
    for j := 1 to count do write('0');
  end;
  writeln;
end.
