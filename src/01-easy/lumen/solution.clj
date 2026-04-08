(ns Solution (:gen-class))
(defn -main [& _]
  (let [n (Integer/parseInt (read-line)) l (Integer/parseInt (read-line))
        g (vec (for [_ (range n)] (vec (.split (read-line) " "))))]
    (println (count (for [r (range n) c (range n)
                         :when (not (some (fn [r2] (some (fn [c2]
                           (and (= (get-in g [r2 c2]) "C") (< (max (Math/abs (- r r2)) (Math/abs (- c c2))) l)))
                           (range n))) (range n)))] 1)))))
