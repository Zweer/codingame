open System
let L = Console.ReadLine() |> int
let H = Console.ReadLine() |> int
let T = Console.ReadLine().ToUpper()
let rows = [| for _ in 0..H-1 -> Console.ReadLine() |]
for i in 0..H-1 do
    T |> Seq.iter (fun c ->
        let idx = int c - 65 in let idx = if idx<0||idx>25 then 26 else idx
        printf "%s" (rows.[i].Substring(idx*L, L)))
    printfn ""
