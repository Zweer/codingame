let () =
  let n = Scanf.scanf " %d" Fun.id in
  let l = Scanf.scanf " %d " Fun.id in
  let g = Array.init n (fun _ -> String.split_on_char ' ' (input_line stdin) |> Array.of_list) in
  let d = ref 0 in
  for r = 0 to n-1 do for c = 0 to n-1 do
    let lit = ref false in
    for r2 = 0 to n-1 do for c2 = 0 to n-1 do
      if g.(r2).(c2) = "C" && max (abs(r-r2)) (abs(c-c2)) < l then lit := true
    done done;
    if not !lit then incr d
  done done;
  print_int !d; print_newline ()
