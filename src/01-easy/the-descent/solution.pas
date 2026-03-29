program TheDesc;
var h, max, idx, i: integer;
begin
    while true do begin
        max := -1; idx := 0;
        for i := 0 to 7 do begin
            readln(h);
            if h > max then begin max := h; idx := i end;
        end;
        writeln(idx);
    end;
end.
