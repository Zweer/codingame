import Data.List (sort)
main :: IO ()
main = do
    n <- readLn :: IO Int
    h <- mapM (\_ -> readLn :: IO Int) [1..n]
    let s = sort h
    print $ minimum $ zipWith (-) (tail s) s
