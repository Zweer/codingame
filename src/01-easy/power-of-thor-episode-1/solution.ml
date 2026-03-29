let () =
  let line = input_line stdin in
  let parts = String.split_on_char ' ' line in
  let nums = List.map int_of_string parts in
  let lx = List.nth nums 0 and ly = List.nth nums 1 in
  let tx = ref (List.nth nums 2) and ty = ref (List.nth nums 3) in
  while true do
    ignore (input_line stdin);
    let dir = Buffer.create 2 in
    if !ty > ly then (Buffer.add_char dir 'N'; decr ty)
    else if !ty < ly then (Buffer.add_char dir 'S'; incr ty);
    if !tx > lx then (Buffer.add_char dir 'W'; decr tx)
    else if !tx < lx then (Buffer.add_char dir 'E'; incr tx);
    print_endline (Buffer.contents dir)
  done
