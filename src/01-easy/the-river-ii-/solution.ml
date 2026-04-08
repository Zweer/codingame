let ds n = let s = ref 0 in let x = ref n in
  while !x > 0 do s := !s + !x mod 10; x := !x / 10 done; !s
let () =
  let r = Scanf.scanf " %d" Fun.id in
  let lo = max 1 (r - 45) in
  let found = ref false in
  for x = lo to r - 1 do if x + ds x = r then found := true done;
  print_endline (if !found then "YES" else "NO")
