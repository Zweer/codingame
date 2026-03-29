import System.IO
main :: IO ()
main = do
    hSetBuffering stdout NoBuffering
    n <- readLn :: IO Int
    if n == 0 then print 0
    else do
        line <- getLine
        let t = map read (words line) :: [Int]
            closer a b = if abs a < abs b || (abs a == abs b && a > 0) then a else b
        print (foldl1 closer t)
