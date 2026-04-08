import System.IO (hSetBuffering, stdout, BufferMode(NoBuffering))
import Data.Array
import Data.Sequence (Seq(..), (|>))
import qualified Data.Sequence as Seq

main :: IO ()
main = do
    hSetBuffering stdout NoBuffering
    [w, h] <- map read . words <$> getLine
    g <- mapM (\_ -> getLine) [1..h]
    let ga = listArray ((0,0),(h-1,w-1)) [g!!r!!c | r<-[0..h-1], c<-[0..w-1]]
        (sr,sc) = head [(r,c) | r<-[0..h-1], c<-[0..w-1], ga!(r,c)=='S']
        initD = listArray ((0,0),(h-1,w-1)) (repeat (-1)) // [((sr,sc),0)]
        dirs = [(0,1),(0,-1),(1,0),(-1,0)]
        bfs d Empty = d
        bfs d ((r,c) :<| rest) =
            let ns = [(nr,nc) | (dr,dc)<-dirs, let nr=(r+dr+h)`mod`h, let nc=(c+dc+w)`mod`w, ga!(nr,nc)/='#', d!(nr,nc)==(-1)]
                d' = d // map (\p -> (p, d!(r,c)+1)) ns
            in bfs d' (foldl (|>) rest ns)
        dist = bfs initD (Seq.singleton (sr,sc))
        ch = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    mapM_ (\r -> putStrLn [if ga!(r,c)=='#' then '#' else if dist!(r,c)==(-1) then '.' else ch!!(dist!(r,c)) | c<-[0..w-1]]) [0..h-1]
