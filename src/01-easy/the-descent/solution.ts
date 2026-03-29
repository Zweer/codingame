while (true) {
    let max = -1, idx = 0;
    for (let i = 0; i < 8; i++) {
        const h = parseInt(readline());
        if (h > max) { max = h; idx = i; }
    }
    console.log(idx);
}
