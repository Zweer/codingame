import Data.Char(digitToInt)
ds n = sum $ map digitToInt $ show n
main = do
  r <- readLn :: IO Int
  putStrLn $ if any (\x -> x + ds x == r) [max 1 (r-45)..r-1] then "YES" else "NO"
