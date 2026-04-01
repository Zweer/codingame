let () =
  let msg = input_line stdin in
  let bin = Buffer.create 256 in
  String.iter (fun c ->
    let n = Char.code c in
    for b = 6 downto 0 do
      Buffer.add_char bin (if n land (1 lsl b) <> 0 then '1' else '0')
    done) msg;
  let s = Buffer.contents bin in
  let len = String.length s in
  let first = ref true in
  let i = ref 0 in
  while !i < len do
    let cur = s.[!i] in
    let count = ref 0 in
    while !i < len && s.[!i] = cur do incr count; incr i done;
    if not !first then print_char ' ';
    first := false;
    Printf.printf "%s %s" (if cur = '1' then "0" else "00") (String.make !count '0')
  done;
  print_newline ()
