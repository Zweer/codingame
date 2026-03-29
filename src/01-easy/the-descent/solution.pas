program Answer;
var
    h, mx, idx, i: integer;
begin
    while true do
    begin
        mx := -1;
        idx := 0;
        for i := 0 to 7 do
        begin
            readln(h);
            if h > mx then
            begin
                mx := h;
                idx := i;
            end;
        end;
        writeln(idx);
    end;
end.
