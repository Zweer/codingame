import System.IO (hSetBuffering, stdout, BufferMode(NoBuffering))
import qualified Data.Set as S

dss :: Int -> Int
dss 0 = 0
dss n = let d = n `mod` 10 in d*d + dss (n `div` 10)

isHappy :: S.Set Int -> Int -> Bool
isHappy _ 1 = True
isHappy seen x
  | S.member x seen = False
  | otherwise = isHappy (S.insert x seen) (dss x)

main :: IO ()
main = do
    hSetBuffering stdout NoBuffering
    n <- readLn :: IO Int
    mapM_ (\_ -> do
        s <- getLine
        let x = sum [d*d | c <- s, let d = fromEnum c - 48]
        putStrLn $ s ++ if isHappy S.empty x then " :)" else " :("
        ) [1..n]
