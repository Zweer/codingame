open System
[<EntryPoint>]
let main _ =
    while true do
        let mutable max = -1
        let mutable idx = 0
        for i in 0..7 do
            let h = Console.ReadLine() |> int
            if h > max then max <- h; idx <- i
        printfn "%d" idx
    0
