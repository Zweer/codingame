let () =
  let c = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ" in
  let line = input_line stdin in
  let i = String.index line ' ' in
  let w = int_of_string (String.sub line 0 i) in
  let h = int_of_string (String.sub line (i+1) (String.length line - i - 1)) in
  let g = Array.init h (fun _ -> input_line stdin) in
  let d = Array.init h (fun _ -> Array.make w (-1)) in
  let sr = ref 0 and sc = ref 0 in
  for r = 0 to h-1 do for c2 = 0 to w-1 do if g.(r).[c2] = 'S' then (sr := r; sc := c2) done done;
  d.(!sr).(!sc) <- 0;
  let q = Queue.create () in Queue.push (!sr, !sc) q;
  let dirs = [|(0,1);(0,-1);(1,0);(-1,0)|] in
  while not (Queue.is_empty q) do
    let (r, c2) = Queue.pop q in
    Array.iter (fun (dr, dc) ->
      let nr = (r+dr+h) mod h and nc = (c2+dc+w) mod w in
      if g.(nr).[nc] <> '#' && d.(nr).(nc) = -1 then (d.(nr).(nc) <- d.(r).(c2)+1; Queue.push (nr,nc) q)
    ) dirs
  done;
  for r = 0 to h-1 do
    for c2 = 0 to w-1 do
      print_char (if g.(r).[c2] = '#' then '#' else if d.(r).(c2) = -1 then '.' else c.[d.(r).(c2)])
    done; print_newline ()
  done
