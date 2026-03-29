(ns Player
  (:gen-class))
(defn -main [& args]
  (let [[lx ly tx ty] (map #(Integer/parseInt %) (.split (read-line) " "))]
    (loop [tx tx ty ty]
      (read-line)
      (let [dy (compare ly ty)
            dx (compare lx tx)
            ns (case dy -1 "N" 1 "S" "")
            ew (case dx -1 "W" 1 "E" "")]
        (println (str ns ew))
        (recur (+ tx dx) (+ ty dy))))))
