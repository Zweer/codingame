let ds n = let s = ref 0 in let x = ref n in
  while !x > 0 do s := !s + !x mod 10; x := !x / 10 done; !s
let () =
  let r1 = ref (Scanf.scanf " %d" Fun.id) in
  let r2 = ref (Scanf.scanf " %d" Fun.id) in
  while !r1 <> !r2 do
    if !r1 < !r2 then r1 := !r1 + ds !r1 else r2 := !r2 + ds !r2
  done;
  Printf.printf "%d\n" !r1
