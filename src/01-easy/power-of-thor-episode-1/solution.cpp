#include <iostream>
#include <string>
using namespace std;
int main() {
    int lx, ly, tx, ty, e;
    cin >> lx >> ly >> tx >> ty;
    while (1) {
        cin >> e;
        string dir;
        if (ty > ly) { dir += "N"; ty--; }
        else if (ty < ly) { dir += "S"; ty++; }
        if (tx > lx) { dir += "W"; tx--; }
        else if (tx < lx) { dir += "E"; tx++; }
        cout << dir << endl;
    }
}
