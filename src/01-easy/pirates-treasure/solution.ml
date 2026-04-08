let () =
  let w = Scanf.scanf " %d" Fun.id in
  let h = Scanf.scanf " %d" Fun.id in
  let g = Array.init h (fun _ -> Array.init w (fun _ -> Scanf.scanf " %d" Fun.id)) in
  let dx = [|-1;-1;-1;0;0;1;1;1|] and dy = [|-1;0;1;-1;1;-1;0;1|] in
  for y = 0 to h-1 do for x = 0 to w-1 do
    if g.(y).(x) = 0 then begin
      let ok = ref true in
      Array.iteri (fun i ddx -> let nx = x+ddx and ny = y+dy.(i) in
        if nx>=0 && nx<w && ny>=0 && ny<h && g.(ny).(nx)<>1 then ok := false) dx;
      if !ok then (Printf.printf "%d %d\n" x y; exit 0)
    end
  done done
