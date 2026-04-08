open System
[<EntryPoint>]
let main _ =
    let w = Console.ReadLine() |> int
    let h = Console.ReadLine() |> int
    let g = [| for _ in 0..h-1 -> Console.ReadLine().Split(' ') |> Array.map int |]
    let dx = [|-1;-1;-1;0;0;1;1;1|]
    let dy = [|-1;0;1;-1;1;-1;0;1|]
    for y in 0..h-1 do for x in 0..w-1 do
        if g.[y].[x] = 0 then
            let ok = Array.forall2 (fun ddx ddy ->
                let nx, ny = x+ddx, y+ddy
                nx<0||nx>=w||ny<0||ny>=h||g.[ny].[nx]=1) dx dy
            if ok then printfn "%d %d" x y; exit 0
    0
