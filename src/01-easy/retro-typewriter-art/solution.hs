import System.IO (hSetBuffering, stdout, BufferMode(NoBuffering))
import Data.Char (isDigit)
import Data.Map (Map, fromList, lookup)
import Prelude hiding (lookup)

abbr :: Map String Char
abbr = fromList [("sp",' '),("bS",'\\'),("sQ",'\''),("nl",'\n')]

decode :: String -> String
decode tok =
    let l2 = if length tok >= 2 then drop (length tok - 2) tok else ""
        (ch, num) = case lookup l2 abbr of
            Just c  -> (c, take (length tok - 2) tok)
            Nothing -> (last tok, init tok)
        n = if null num then 1 else max 1 (read num)
    in replicate n ch

main :: IO ()
main = do
    hSetBuffering stdout NoBuffering
    line <- getLine
    putStrLn $ concatMap decode (words line)
