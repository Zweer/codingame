import Data.List (elemIndex)
import Data.Maybe (fromJust)

main :: IO ()
main = do
    heights <- mapM (\_ -> readLn :: IO Int) [1..8]
    print $ fromJust $ elemIndex (maximum heights) heights
    main
