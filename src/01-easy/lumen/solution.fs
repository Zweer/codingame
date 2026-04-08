open System
[<EntryPoint>]
let main _ =
    let n = Console.ReadLine() |> int
    let l = Console.ReadLine() |> int
    let g = [| for _ in 0..n-1 -> Console.ReadLine().Split(' ') |]
    let mutable d = 0
    for r in 0..n-1 do for c in 0..n-1 do
        let mutable lit = false
        for r2 in 0..n-1 do for c2 in 0..n-1 do
            if g.[r2].[c2] = "C" && max (abs(r-r2)) (abs(c-c2)) < l then lit <- true
        if not lit then d <- d+1
    printfn "%d" d; 0
