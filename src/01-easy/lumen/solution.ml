let () =
  let n = int_of_string (String.trim (input_line stdin)) in
  let l = int_of_string (String.trim (input_line stdin)) in
  let g = Array.init n (fun _ ->
    let line = String.trim (input_line stdin) in
    let parts = String.split_on_char ' ' line in
    Array.of_list parts) in
  let d = ref 0 in
  for r = 0 to n-1 do for c = 0 to n-1 do
    let lit = ref false in
    for r2 = 0 to n-1 do for c2 = 0 to n-1 do
      if g.(r2).(c2) = "C" && max (abs(r-r2)) (abs(c-c2)) < l then lit := true
    done done;
    if not !lit then incr d
  done done;
  print_int !d; print_newline ()