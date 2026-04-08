#include <stdio.h>
#include <string.h>
#include <stdlib.h>
int main(){
    char line[100001]; fgets(line,sizeof(line),stdin);
    line[strcspn(line,"\n")]=0;
    char *tok=strtok(line," ");
    while(tok){
        int len=strlen(tok);
        char ch; int n;
        if(len>=2 && ((tok[len-2]=='s'&&tok[len-1]=='p')||(tok[len-2]=='b'&&tok[len-1]=='S')||(tok[len-2]=='s'&&tok[len-1]=='Q')||(tok[len-2]=='n'&&tok[len-1]=='l'))){
            if(tok[len-2]=='s'&&tok[len-1]=='p') ch=' ';
            else if(tok[len-2]=='b'&&tok[len-1]=='S') ch='\\';
            else if(tok[len-2]=='s'&&tok[len-1]=='Q') ch='\'';
            else ch='\n';
            tok[len-2]=0;
        } else { ch=tok[len-1]; tok[len-1]=0; }
        n=strlen(tok)>0?atoi(tok):1; if(n<1)n=1;
        for(int i=0;i<n;i++) putchar(ch);
        tok=strtok(NULL," ");
    }
    printf("\n");
}
