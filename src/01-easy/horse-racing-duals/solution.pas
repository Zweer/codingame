program Solution;
{$mode objfpc}
uses sysutils, classes;
var
  n, i, d, m: longint;
  h: array of longint;
procedure qs(lo, hi: longint);
var i, j, pivot, tmp: longint;
begin
  i := lo; j := hi; pivot := h[(lo+hi) div 2];
  while i <= j do begin
    while h[i] < pivot do inc(i);
    while h[j] > pivot do dec(j);
    if i <= j then begin
      tmp := h[i]; h[i] := h[j]; h[j] := tmp;
      inc(i); dec(j);
    end;
  end;
  if lo < j then qs(lo, j);
  if i < hi then qs(i, hi);
end;
begin
  readln(n);
  setlength(h, n);
  for i := 0 to n-1 do readln(h[i]);
  qs(0, n-1);
  m := h[1] - h[0];
  for i := 1 to n-2 do begin
    d := h[i+1] - h[i];
    if d < m then m := d;
  end;
  writeln(m);
end.
