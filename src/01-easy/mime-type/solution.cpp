#include <iostream>
#include <map>
#include <algorithm>
using namespace std;
int main() {
    int n, q; cin >> n >> q; cin.ignore();
    map<string,string> m;
    for (int i = 0; i < n; i++) {
        string ext, mt; cin >> ext >> mt;
        transform(ext.begin(), ext.end(), ext.begin(), ::tolower);
        m[ext] = mt;
    }
    cin.ignore();
    for (int i = 0; i < q; i++) {
        string f; getline(cin, f);
        auto dot = f.rfind('.');
        if (dot == string::npos) { cout << "UNKNOWN" << endl; continue; }
        string ext = f.substr(dot + 1);
        transform(ext.begin(), ext.end(), ext.begin(), ::tolower);
        auto it = m.find(ext);
        cout << (it != m.end() ? it->second : "UNKNOWN") << endl;
    }
}
