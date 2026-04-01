#include <bits/stdc++.h>
using namespace std;
const int MX = 1024;
struct Poly { bitset<MX> b; int deg() const { for(int i=MX-1;i>=0;i--) if(b[i]) return i; return -1; } bool zero() const { return deg()<0; } bool one() const { return deg()==0; } };
Poly mul(Poly a, Poly b) { Poly r; int da=a.deg(); if(da<0||b.zero()) return r; for(int i=0;i<=da;i++) if(a.b[i]) r.b^=(b.b<<i); return r; }
pair<Poly,Poly> dvm(Poly a, Poly b) { Poly q; int db=b.deg(); for(;;) { int da=a.deg(); if(da<db) return {q,a}; q.b.set(da-db); a.b^=(b.b<<(da-db)); } }
Poly pmod(Poly a, Poly b) { return dvm(a,b).second; }
Poly pdiv(Poly a, Poly b) { return dvm(a,b).first; }
Poly gcd(Poly a, Poly b) { while(!b.zero()){Poly r=pmod(a,b);a=b;b=r;} return a; }
Poly sqrtP(Poly a) { Poly r; for(int i=0;i<=a.deg();i+=2) if(a.b[i]) r.b.set(i/2); return r; }

vector<Poly> berlekamp(Poly f) {
    int n=f.deg(); if(n<=1) return {f};
    vector<bitset<MX>> mat(n);
    for(int i=0;i<n;i++) { Poly xi; xi.b.set(2*i); Poly r=pmod(xi,f); for(int j=0;j<n;j++) mat[j][i]=r.b[j]; mat[i].flip(i); }
    vector<int> piv(n,-1);
    for(int c=0;c<n;c++) { int row=-1; for(int r=0;r<n;r++) if(piv[r]==-1&&mat[r][c]){row=r;break;} if(row<0) continue; piv[row]=c; for(int r=0;r<n;r++) if(r!=row&&mat[r][c]) mat[r]^=mat[row]; }
    vector<Poly> basis;
    for(int c=0;c<n;c++) { bool ip=false; for(int r=0;r<n;r++) if(piv[r]==c){ip=true;break;} if(ip) continue; Poly v; v.b.set(c); for(int r=0;r<n;r++) if(piv[r]>=0&&mat[r][c]) v.b.set(piv[r]); basis.push_back(v); }
    vector<Poly> facs={f};
    for(auto&h:basis) { vector<Poly> nf; for(auto&g:facs) { if(g.deg()<=1){nf.push_back(g);continue;} Poly d=gcd(g,h); if(!d.one()&&d.deg()<g.deg()){nf.push_back(d);nf.push_back(pdiv(g,d));} else{Poly h1=h;h1.b.flip(0);d=gcd(g,h1);if(!d.one()&&d.deg()<g.deg()){nf.push_back(d);nf.push_back(pdiv(g,d));}else nf.push_back(g);} } facs=nf; }
    return facs;
}

vector<Poly> factorize(Poly f) {
    Poly df; for(int i=1;i<=f.deg();i++) if((i&1)&&f.b[i]) df.b.set(i-1);
    if(df.zero()) { Poly g=sqrtP(f); auto s=factorize(g); vector<Poly> r; for(auto&p:s){r.push_back(p);r.push_back(p);} return r; }
    Poly g=gcd(f,df); if(g.one()) return berlekamp(f);
    auto r1=factorize(pdiv(f,g)), r2=factorize(g); r1.insert(r1.end(),r2.begin(),r2.end()); return r1;
}

// Print poly as sz/32 hex words, FIRST word = lowest bits (little-endian word order)
string toHex(Poly p, int sz) {
    string r;
    for(int i=0;i<sz/32;i++) {
        unsigned v=0; for(int j=0;j<32;j++) if(p.b[i*32+j]) v|=(1u<<j);
        char buf[16]; sprintf(buf,"%08x",v);
        if(!r.empty()) r+=" "; r+=buf;
    }
    return r;
}

int main() {
    int sz; cin>>sz;
    Poly f; for(int i=0;i<sz/16;i++) { unsigned v; cin>>hex>>v; for(int j=0;j<32;j++) if(v&(1u<<j)) f.b.set(i*32+j); }
    auto facs=factorize(f);
    int n=facs.size();
    set<string> out;
    for(int m=0;m<(1<<n);m++) {
        Poly a,b; a.b.set(0); b.b.set(0);
        for(int i=0;i<n;i++) { if(m&(1<<i)) a=mul(a,facs[i]); else b=mul(b,facs[i]); }
        if(a.deg()>=sz||b.deg()>=sz) continue;
        out.insert(toHex(a,sz)+" "+toHex(b,sz));
    }
    for(auto&s:out) cout<<s<<"\n";
}
