#include <iostream>
#include <string>
using namespace std;
int main() {
    string msg;
    getline(cin, msg);
    string bin;
    for (char c : msg)
        for (int b = 6; b >= 0; b--)
            bin += ((c >> b) & 1) ? '1' : '0';
    bool first = true;
    int i = 0;
    while (i < (int)bin.size()) {
        char cur = bin[i];
        int count = 0;
        while (i < (int)bin.size() && bin[i] == cur) { count++; i++; }
        if (!first) cout << " ";
        first = false;
        cout << (cur == '1' ? "0" : "00") << " " << string(count, '0');
    }
    cout << endl;
}
