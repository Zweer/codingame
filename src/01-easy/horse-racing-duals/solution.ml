let () =
  let n = Scanf.scanf " %d" Fun.id in
  let h = Array.init n (fun _ -> Scanf.scanf " %d" Fun.id) in
  Array.sort compare h;
  let m = ref (h.(1) - h.(0)) in
  for i = 1 to n - 2 do
    let d = h.(i+1) - h.(i) in
    if d < !m then m := d
  done;
  print_int !m; print_newline ()
