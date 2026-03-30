let () =
  let n = Scanf.scanf " %d" Fun.id in
  let q = Scanf.scanf " %d" Fun.id in
  let tbl = Hashtbl.create n in
  for _ = 1 to n do
    let ext = Scanf.scanf " %s" Fun.id in
    let mt = Scanf.scanf " %s" Fun.id in
    Hashtbl.replace tbl (String.lowercase_ascii ext) mt
  done;
  for _ = 1 to q do
    let f = Scanf.scanf " %[^\n]" Fun.id in
    try
      let dot = String.rindex f '.' in
      let ext = String.lowercase_ascii (String.sub f (dot + 1) (String.length f - dot - 1)) in
      print_endline (Hashtbl.find tbl ext)
    with Not_found -> print_endline "UNKNOWN"
  done
