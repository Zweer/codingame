import System.IO
import Control.Monad
import Data.List (maximumBy)
import Data.Ord (comparing)

main :: IO ()
main = do
    hSetBuffering stdout NoBuffering
    loop

loop :: IO ()
loop = do
    heights <- replicateM 8 readLn :: IO [Int]
    let (_, idx) = maximumBy (comparing fst) (zip heights [0..])
    print idx
    loop
