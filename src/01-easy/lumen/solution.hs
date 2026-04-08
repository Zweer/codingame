import System.IO(hSetBuffering,stdout,BufferMode(NoBuffering))
main::IO()
main=do
    hSetBuffering stdout NoBuffering
    n<-readLn::IO Int;l<-readLn::IO Int
    g<-mapM(\_ ->words<$>getLine)[1..n]
    let dark=length[()| r<-[0..n-1],c<-[0..n-1],not$any(\r2->any(\c2->g!!r2!!c2=="C"&&max(abs(r-r2))(abs(c-c2))<l)[0..n-1])[0..n-1]]
    print dark
