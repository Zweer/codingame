open System
let n = Console.ReadLine() |> int
let h = [| for _ in 1..n -> Console.ReadLine() |> int |] |> Array.sort
let m = Array.init (n-1) (fun i -> h.[i+1] - h.[i]) |> Array.min
printfn "%d" m
