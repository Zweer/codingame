let dss n =
  let rec aux x s = if x = 0 then s else let d = x mod 10 in aux (x/10) (s+d*d) in
  aux n 0

let is_happy x =
  let module S = Set.Make(Int) in
  let rec go seen x = if x = 1 then true else if S.mem x seen then false else go (S.add x seen) (dss x) in
  go S.empty x

let () =
  let n = int_of_string (input_line stdin) in
  for _ = 1 to n do
    let s = String.trim (input_line stdin) in
    let x = String.fold_left (fun a c -> a + (Char.code c - 48) * (Char.code c - 48)) 0 s in
    Printf.printf "%s %s\n" s (if is_happy x then ":)" else ":(")
  done
