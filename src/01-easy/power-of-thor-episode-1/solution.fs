open System
[<EntryPoint>]
let main _ =
    let s = Console.ReadLine().Split(' ')
    let lx = int s.[0]
    let ly = int s.[1]
    let mutable tx = int s.[2]
    let mutable ty = int s.[3]
    while true do
        Console.ReadLine() |> ignore
        let mutable dir = ""
        if ty > ly then dir <- dir + "N"; ty <- ty - 1
        elif ty < ly then dir <- dir + "S"; ty <- ty + 1
        if tx > lx then dir <- dir + "W"; tx <- tx - 1
        elif tx < lx then dir <- dir + "E"; tx <- tx + 1
        printfn "%s" dir
    0
