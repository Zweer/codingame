// game loop
while (true) {
    let maxH = -1;
    let maxI = 0;
    for (let i = 0; i < 8; i++) {
        const h = parseInt(readline());
        if (h > maxH) { maxH = h; maxI = i; }
    }
    console.log(maxI);
}
