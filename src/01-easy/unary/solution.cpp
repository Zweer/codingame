#include <iostream>
#include <string>
using namespace std;

int main() {
    string msg;
    getline(cin, msg);

    string bits;
    for (char c : msg) {
        for (int i = 6; i >= 0; i--)
            bits += ((c >> i) & 1) ? '1' : '0';
    }

    string result;
    int i = 0;
    while (i < (int)bits.size()) {
        char bit = bits[i];
        int count = 0;
        while (i < (int)bits.size() && bits[i] == bit) { count++; i++; }
        if (!result.empty()) result += " ";
        result += (bit == '1') ? "0" : "00";
        result += " ";
        result += string(count, '0');
    }
    cout << result << endl;
}
