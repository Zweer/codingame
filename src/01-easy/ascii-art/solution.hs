import Data.Char(toUpper,ord)
main = do
  l <- readLn :: IO Int
  h <- readLn :: IO Int
  t <- fmap (map toUpper) getLine
  rows <- sequence [getLine | _ <- [1..h]]
  mapM_ (\row -> putStrLn $ concatMap (\c ->
    let idx = ord c - 65; i = if idx<0||idx>25 then 26 else idx
    in take l (drop (i*l) row)) t) rows
