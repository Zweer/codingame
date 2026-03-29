while true do
  let mx = ref (-1) in
  let idx = ref 0 in
  for i = 0 to 7 do
    let h = int_of_string (input_line stdin) in
    if h > !mx then (mx := h; idx := i)
  done;
  print_int !idx;
  print_newline ()
done
