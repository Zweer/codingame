open System
let msg = Console.ReadLine()
let bin = msg |> Seq.map (fun c -> Convert.ToString(int c, 2).PadLeft(7, '0')) |> String.concat ""
let mutable i = 0
let mutable first = true
while i < bin.Length do
    let cur = bin.[i]
    let mutable count = 0
    while i < bin.Length && bin.[i] = cur do
        count <- count + 1
        i <- i + 1
    if not first then printf " "
    first <- false
    printf "%s %s" (if cur = '1' then "0" else "00") (String('0', count))
printfn ""
