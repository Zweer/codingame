#include<cstdio>
#include<map>
#include<string>
#include<cstring>
using namespace std;char s[100001];map<string,int>D;map<int,long long>C;const char*M[]={".-","-...","-.-.","-..",".","..-.","--.","....","..",".---","-.-",".-..","--","-.","---",".--.","--.-",".-.","...","-","..-","...-",".--","-..-","-.--","--.."};long long f(int i){int n=strlen(s);if(i==n)return 1;if(C.count(i))return C[i];long long r=0;for(auto&[k,v]:D){int l=k.size();if(i+l<=n&&!strncmp(s+i,k.c_str(),l))r+=v*f(i+l);}return C[i]=r;}int main(){scanf("%s",s);int n;scanf("%d",&n);for(;n--;){char w[99];scanf("%s",w);string m;for(int i=0;w[i];i++)m+=M[w[i]-'A'];D[m]++;}printf("%lld",f(0));}