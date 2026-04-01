program Unary;
var
  msg, bin, s: string;
  i, j, count, n: integer;
  cur: char;
  first: boolean;
begin
  readln(msg);
  bin := '';
  for i := 1 to Length(msg) do begin
    n := Ord(msg[i]);
    for j := 6 downto 0 do
      if (n shr j) and 1 = 1 then bin := bin + '1'
      else bin := bin + '0';
  end;
  i := 1;
  first := true;
  while i <= Length(bin) do begin
    cur := bin[i];
    count := 0;
    while (i <= Length(bin)) and (bin[i] = cur) do begin inc(count); inc(i); end;
    if not first then write(' ');
    first := false;
    if cur = '1' then write('0') else write('00');
    write(' ');
    for j := 1 to count do write('0');
  end;
  writeln;
end.
