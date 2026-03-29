{$H+}
program Answer;
var
    lx, ly, tx, ty, e: integer;
    dir: string;
begin
    readln(lx, ly, tx, ty);
    while true do
    begin
        readln(e);
        dir := '';
        if ty > ly then begin dir := dir + 'N'; dec(ty); end
        else if ty < ly then begin dir := dir + 'S'; inc(ty); end;
        if tx > lx then begin dir := dir + 'W'; dec(tx); end
        else if tx < lx then begin dir := dir + 'E'; inc(tx); end;
        writeln(dir);
        flush(output);
    end;
end.
