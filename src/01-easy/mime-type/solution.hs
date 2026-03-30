import Data.Char (toLower)
import Data.Map.Strict (Map, fromList, findWithDefault)
lower :: String -> String
lower = map toLower
getExt :: String -> Maybe String
getExt s = case break (=='.') (reverse s) of
    (_, [])  -> Nothing
    (r, _:_) -> Just (lower (reverse r))
main :: IO ()
main = do
    n <- readLn :: IO Int
    q <- readLn :: IO Int
    pairs <- mapM (\_ -> do
        l <- getLine
        let (ext:mt:_) = words l
        return (lower ext, mt)) [1..n]
    let m = fromList pairs
    mapM_ (\_ -> do
        f <- getLine
        putStrLn $ case getExt f of
            Nothing  -> "UNKNOWN"
            Just ext -> findWithDefault "UNKNOWN" ext m) [1..q]
