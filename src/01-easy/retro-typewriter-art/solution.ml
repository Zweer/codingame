let ab = [("sp", ' '); ("bS", '\\'); ("sQ", '\''); ("nl", '\n')]

let decode tok =
  let len = String.length tok in
  let l2 = if len >= 2 then String.sub tok (len-2) 2 else "" in
  match List.assoc_opt l2 ab with
  | Some ch ->
    let num = String.sub tok 0 (len-2) in
    let n = if num = "" then 1 else max 1 (int_of_string num) in
    String.make n ch
  | None ->
    let ch = tok.[len-1] in
    let num = String.sub tok 0 (len-1) in
    let n = if num = "" then 1 else max 1 (int_of_string num) in
    String.make n ch

let () =
  let line = input_line stdin in
  let toks = String.split_on_char ' ' line in
  print_endline (String.concat "" (List.map decode toks))
