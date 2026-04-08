import System.IO (hSetBuffering, stdout, BufferMode(NoBuffering))
solve :: String -> Int
solve [] = 0
solve ('f':xs) = 1 + solve (drop 2 xs)
solve (_:xs) = solve xs
main :: IO ()
main = do
    hSetBuffering stdout NoBuffering
    n <- readLn :: IO Int
    mapM_ (\_ -> do s <- getLine; print (solve s)) [1..n]
