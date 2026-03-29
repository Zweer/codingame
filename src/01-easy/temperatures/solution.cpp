#include <iostream>
#include <cstdlib>
using namespace std;
int main() {
    int n; cin >> n;
    if (n == 0) { cout << 0 << endl; return 0; }
    int r; cin >> r;
    for (int i = 1; i < n; i++) {
        int v; cin >> v;
        if (abs(v) < abs(r) || (abs(v) == abs(r) && v > 0)) r = v;
    }
    cout << r << endl;
}
