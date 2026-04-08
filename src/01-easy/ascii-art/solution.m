#import <stdio.h>
#import <string.h>
#import <ctype.h>
int main(){
    int L,H;char T[300],rows[30][1200];
    scanf("%d%d ",&L,&H);fgets(T,sizeof(T),stdin);T[strcspn(T,"\n")]=0;
    for(int i=0;i<H;i++){fgets(rows[i],sizeof(rows[i]),stdin);rows[i][strcspn(rows[i],"\n")]=0;}
    for(int i=0;i<H;i++){
        for(int j=0;T[j];j++){
            int idx=toupper(T[j])-'A';if(idx<0||idx>25)idx=26;
            printf("%.*s",L,rows[i]+idx*L);
        }
        printf("\n");
    }
}
