open System
open System.Collections.Generic
let dss (n:int) =
    let mutable x = n
    let mutable s = 0
    while x > 0 do
        let d = x % 10
        s <- s + d*d
        x <- x / 10
    s
[<EntryPoint>]
let main _ =
    let n = Console.ReadLine() |> int
    for _ in 1..n do
        let s = Console.ReadLine().Trim()
        let mutable x = s |> Seq.sumBy (fun c -> let d = int c - 48 in d*d)
        let seen = HashSet<int>()
        while x <> 1 && seen.Add(x) do x <- dss x
        printfn "%s %s" s (if x = 1 then ":)" else ":(")
    0
