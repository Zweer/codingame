#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;
int main() {
    int n; cin >> n;
    vector<int> h(n);
    for (auto &x : h) cin >> x;
    sort(h.begin(), h.end());
    int m = h[1] - h[0];
    for (int i = 1; i < n - 1; i++) m = min(m, h[i+1] - h[i]);
    cout << m << endl;
}
