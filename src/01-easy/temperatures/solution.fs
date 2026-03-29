open System
[<EntryPoint>]
let main _ =
    let n = Console.ReadLine() |> int
    if n = 0 then printfn "0"
    else
        let t = Console.ReadLine().Split(' ') |> Array.map int
        let mutable r = t.[0]
        for v in t do
            if abs v < abs r || (abs v = abs r && v > 0) then r <- v
        printfn "%d" r
    0
