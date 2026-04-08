let () =
  let l = int_of_string (String.trim (input_line stdin)) in
  let h = int_of_string (String.trim (input_line stdin)) in
  let t = String.uppercase_ascii (input_line stdin) in
  let need = 27 * l in
  let pad s = if String.length s >= need then s else s ^ String.make (need - String.length s) ' ' in
  let rows = Array.init h (fun _ -> pad (input_line stdin)) in
  for i = 0 to h - 1 do
    String.iter (fun c ->
      let idx = Char.code c - 65 in
      let idx = if idx < 0 || idx > 25 then 26 else idx in
      print_string (String.sub rows.(i) (idx * l) l)) t;
    print_newline ()
  done
