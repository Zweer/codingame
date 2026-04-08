(ns Solution (:gen-class))
(defn decode [tok]
  (let [ab {"sp" \space "bS" \\ "sQ" \' "nl" \newline}
        l2 (if (>= (count tok) 2) (subs tok (- (count tok) 2)) "")
        [ch num] (if (ab l2)
                   [(ab l2) (subs tok 0 (- (count tok) 2))]
                   [(last tok) (subs tok 0 (dec (count tok)))])
        n (if (empty? num) 1 (max 1 (Integer/parseInt num)))]
    (apply str (repeat n ch))))
(defn -main [& _]
  (let [line (read-line)]
    (println (apply str (map decode (clojure.string/split line #" "))))))
