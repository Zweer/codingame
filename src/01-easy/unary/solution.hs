import Data.Char (ord)
import Data.List (group, intercalate)
import Numeric (showIntAtBase)

toBin :: Char -> String
toBin c = let s = showIntAtBase 2 (\d -> "01" !! d) (ord c) ""
          in replicate (7 - length s) '0' ++ s

encode :: String -> String
encode = intercalate " " . map encGroup . group
  where encGroup g = (if head g == '1' then "0" else "00") ++ " " ++ replicate (length g) '0'

main :: IO ()
main = do
    msg <- getLine
    putStrLn $ encode $ concatMap toBin msg
