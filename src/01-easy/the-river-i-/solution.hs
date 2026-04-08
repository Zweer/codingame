import Data.Char(digitToInt)
ds n = sum $ map digitToInt $ show n
solve r1 r2
  | r1 == r2 = r1
  | r1 < r2  = solve (r1 + ds r1) r2
  | otherwise = solve r1 (r2 + ds r2)
main = do
  r1 <- readLn
  r2 <- readLn
  print (solve r1 r2)
