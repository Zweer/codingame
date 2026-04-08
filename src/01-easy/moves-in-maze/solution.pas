{$H+}
program Answer;
uses SysUtils;
const C = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
var
    w, h, sr, sc, qi, qe, i, r2, c2, nr, nc: integer;
    g: array[0..99] of string;
    d: array[0..99, 0..99] of integer;
    qr, qc: array[0..9999] of integer;
    dr: array[0..3] of integer = (0, 0, 1, -1);
    dc: array[0..3] of integer = (1, -1, 0, 0);
    s: string;
begin
    readln(w, h);
    for i := 0 to h-1 do begin readln(g[i]); for r2 := 0 to w-1 do d[i][r2] := -1; end;
    sr := 0; sc := 0;
    for r2 := 0 to h-1 do for c2 := 0 to w-1 do if g[r2][c2+1] = 'S' then begin sr := r2; sc := c2; end;
    d[sr][sc] := 0; qi := 0; qe := 0;
    qr[qe] := sr; qc[qe] := sc; Inc(qe);
    while qi < qe do begin
        r2 := qr[qi]; c2 := qc[qi]; Inc(qi);
        for i := 0 to 3 do begin
            nr := ((r2 + dr[i]) + h) mod h; nc := ((c2 + dc[i]) + w) mod w;
            if (g[nr][nc+1] <> '#') and (d[nr][nc] = -1) then begin
                d[nr][nc] := d[r2][c2] + 1; qr[qe] := nr; qc[qe] := nc; Inc(qe);
            end;
        end;
    end;
    for r2 := 0 to h-1 do begin
        s := '';
        for c2 := 0 to w-1 do
            if g[r2][c2+1] = '#' then s := s + '#'
            else if d[r2][c2] = -1 then s := s + '.'
            else s := s + C[d[r2][c2]+1];
        writeln(s); flush(output);
    end;
end.
