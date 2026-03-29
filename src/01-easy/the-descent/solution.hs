import Data.List (elemIndex)
import Data.Maybe (fromJust)

loop :: IO ()
loop = do
    heights <- sequence [readLn :: IO Int | _ <- [1..8]]
    putStrLn $ show $ fromJust $ elemIndex (maximum heights) heights
    loop

main :: IO ()
main = loop
