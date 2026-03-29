import System.IO
import Control.Monad

main :: IO ()
main = do
    hSetBuffering stdout NoBuffering
    line <- getLine
    let [lx, ly, tx, ty] = map read (words line) :: [Int]
    loop lx ly tx ty

loop :: Int -> Int -> Int -> Int -> IO ()
loop lx ly tx ty = do
    _ <- getLine
    let (ns, ty') = if ty > ly then ("N", ty-1) else if ty < ly then ("S", ty+1) else ("", ty)
    let (ew, tx') = if tx > lx then ("W", tx-1) else if tx < lx then ("E", tx+1) else ("", tx)
    putStrLn (ns ++ ew)
    loop lx ly tx' ty'
