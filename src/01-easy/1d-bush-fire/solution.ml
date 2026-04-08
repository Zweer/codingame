let () =
  let n = int_of_string (String.trim (input_line stdin)) in
  for _ = 1 to n do
    let s = input_line stdin in
    let d = ref 0 and j = ref 0 in
    while !j < String.length s do
      if s.[!j] = 'f' then (incr d; j := !j + 3) else incr j
    done;
    print_int !d; print_newline ()
  done
