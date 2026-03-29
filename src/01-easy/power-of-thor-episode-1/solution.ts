const inputs = readline().split(' ').map(Number);
let [lx, ly, tx, ty] = inputs;
while (true) {
    readline();
    let dir = '';
    if (ty > ly) { dir += 'N'; ty--; }
    else if (ty < ly) { dir += 'S'; ty++; }
    if (tx > lx) { dir += 'W'; tx--; }
    else if (tx < lx) { dir += 'E'; tx++; }
    console.log(dir);
}
