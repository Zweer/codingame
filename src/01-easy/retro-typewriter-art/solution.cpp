#include <iostream>
#include <sstream>
#include <string>
#include <map>
using namespace std;
int main(){
    map<string,char> ab={{"sp",' '},{"bS",'\\'},{"sQ",'\''},{"nl",'\n'}};
    string line; getline(cin,line);
    istringstream iss(line); string tok;
    while(iss>>tok){
        char ch; string num;
        string l2=tok.size()>=2?tok.substr(tok.size()-2):"";
        if(ab.count(l2)){ch=ab[l2];num=tok.substr(0,tok.size()-2);}
        else{ch=tok.back();num=tok.substr(0,tok.size()-1);}
        int n=num.empty()?1:stoi(num); if(n<1)n=1;
        for(int i=0;i<n;i++) cout<<ch;
    }
    cout<<endl;
}
