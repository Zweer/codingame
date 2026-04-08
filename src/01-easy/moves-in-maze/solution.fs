open System
open System.Collections.Generic
[<EntryPoint>]
let main _ =
    let C = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    let p = Console.ReadLine().Split(' ') |> Array.map int
    let w, h = p.[0], p.[1]
    let g = [| for _ in 0..h-1 -> Console.ReadLine() |]
    let d = Array2D.create h w -1
    let mutable sr, sc = 0, 0
    for r in 0..h-1 do for c in 0..w-1 do if g.[r].[c] = 'S' then sr <- r; sc <- c
    d.[sr, sc] <- 0
    let q = Queue<int*int>()
    q.Enqueue((sr, sc))
    let dirs = [|(0,1);(0,-1);(1,0);(-1,0)|]
    while q.Count > 0 do
        let r, c = q.Dequeue()
        for dr, dc in dirs do
            let nr, nc = (r+dr+h)%h, (c+dc+w)%w
            if g.[nr].[nc] <> '#' && d.[nr, nc] = -1 then d.[nr, nc] <- d.[r, c]+1; q.Enqueue((nr, nc))
    for r in 0..h-1 do
        printfn "%s" (String [| for c in 0..w-1 -> if g.[r].[c]='#' then '#' elif d.[r,c]= -1 then '.' else C.[d.[r,c]] |])
    0
