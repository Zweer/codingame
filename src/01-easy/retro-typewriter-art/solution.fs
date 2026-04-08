open System
open System.Collections.Generic
[<EntryPoint>]
let main _ =
    let ab = dict ["sp",' ';"bS",'\\';"sQ",'\'';"nl",'\n']
    let line = Console.ReadLine()
    let sb = Text.StringBuilder()
    for tok in line.Split(' ') do
        let l2 = if tok.Length >= 2 then tok.[tok.Length-2..] else ""
        let ch, num =
            if ab.ContainsKey(l2) then ab.[l2], tok.[..tok.Length-3]
            else tok.[tok.Length-1], tok.[..tok.Length-2]
        let n = if String.IsNullOrEmpty(num) then 1 else max 1 (int num)
        sb.Append(String(ch, n)) |> ignore
    printfn "%s" (sb.ToString())
    0
