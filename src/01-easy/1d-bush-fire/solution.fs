open System
[<EntryPoint>]
let main _ =
    let n = Console.ReadLine() |> int
    for _ in 1..n do
        let s = Console.ReadLine().Trim()
        let mutable d = 0
        let mutable j = 0
        while j < s.Length do
            if s.[j] = 'f' then d <- d+1; j <- j+3 else j <- j+1
        printfn "%d" d
    0
