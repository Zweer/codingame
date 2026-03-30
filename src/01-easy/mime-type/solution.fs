open System
open System.Collections.Generic
let n = Console.ReadLine() |> int
let q = Console.ReadLine() |> int
let m = Dictionary<string,string>()
for _ in 1..n do
    let p = Console.ReadLine().Split(' ')
    m.[p.[0].ToLower()] <- p.[1]
for _ in 1..q do
    let f = Console.ReadLine()
    let dot = f.LastIndexOf('.')
    if dot = -1 then printfn "UNKNOWN"
    else
        let ext = f.Substring(dot + 1).ToLower()
        match m.TryGetValue(ext) with
        | true, v -> printfn "%s" v
        | _ -> printfn "UNKNOWN"
