open System
let ds (n:int64) = string n |> Seq.sumBy (fun c -> int64 c - 48L)
let r = Console.ReadLine() |> int64
let lo = max 1L (r-45L)
if {lo..r-1L} |> Seq.exists (fun x -> x + ds x = r) then printfn "YES" else printfn "NO"
