let dss n =
  let rec aux x s = if x = 0 then s else let d = x mod 10 in aux (x/10) (s+d*d) in
  aux n 0

let is_happy x =
  let module S = Set.Make(Int) in
  let rec go seen x = if x = 1 then true else if S.mem x seen then false else go (S.add x seen) (dss x) in
  go S.empty x

let dsq_string s =
  let r = ref 0 in
  for i = 0 to String.length s - 1 do
    let d = Char.code s.[i] - 48 in r := !r + d*d
  done; !r

let () =
  let n = int_of_string (input_line stdin) in
  for _ = 1 to n do
    let s = String.trim (input_line stdin) in
    let x = dsq_string s in
    Printf.printf "%s %s\n" s (if is_happy x then ":)" else ":(")
  done