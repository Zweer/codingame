#include <iostream>
using namespace std;
int main() {
    while (true) {
        int max = -1, idx = 0;
        for (int i = 0; i < 8; i++) {
            int h; cin >> h;
            if (h > max) { max = h; idx = i; }
        }
        cout << idx << endl;
    }
}
