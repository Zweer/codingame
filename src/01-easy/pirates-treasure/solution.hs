import System.IO(hSetBuffering,stdout,BufferMode(NoBuffering))
import System.Exit(exitSuccess)
main::IO()
main=do
    hSetBuffering stdout NoBuffering
    w<-readLn::IO Int;h<-readLn::IO Int
    g<-mapM(\_ ->map read.words<$>getLine)[1..h]::IO[[Int]]
    let dx=[-1,-1,-1,0,0,1,1,1];dy=[-1,0,1,-1,1,-1,0,1]
    sequence_[do
        let ok=all(\i->let nx=x+dx!!i;ny=y+dy!!i in nx<0||nx>=w||ny<0||ny>=h||(g!!ny)!!nx==1)[0..7]
        if ok then putStrLn(show x++" "++show y)>>exitSuccess else return()
        |y<-[0..h-1],x<-[0..w-1],(g!!y)!!x==0]
