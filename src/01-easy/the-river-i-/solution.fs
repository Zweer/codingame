open System
let ds (n:int64) = string n |> Seq.sumBy (fun c -> int64 c - 48L)
let mutable r1 = Console.ReadLine() |> int64
let mutable r2 = Console.ReadLine() |> int64
while r1 <> r2 do
    if r1 < r2 then r1 <- r1 + ds r1 else r2 <- r2 + ds r2
printfn "%d" r1
