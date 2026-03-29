let () =
  let n = int_of_string (input_line stdin) in
  if n = 0 then print_int 0
  else begin
    let parts = String.split_on_char ' ' (input_line stdin) in
    let t = List.map int_of_string parts in
    let closer a b = if abs a < abs b || (abs a = abs b && a > 0) then a else b in
    print_int (List.fold_left closer (List.hd t) (List.tl t))
  end;
  print_newline ()
