R = () => readline().split(' ');
e = {}, [,,,z, s,,,r] = R();
while (r--)e[(x = R())[0]] = x[1];
while (1)[f, p, d] = R(), d = d[0] == 'R', console.log((f == z || f == -1 ? (+p > s && d || +p < s && !d) : (+p > e[f] && d || +p < e[f] && !d)) ? 'BLOCK' : 'WAIT');
