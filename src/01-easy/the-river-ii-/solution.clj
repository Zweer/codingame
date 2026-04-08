(ns Solution (:gen-class))
(defn ds [n] (reduce + (map #(- (int %) 48) (str n))))
(defn -main [& args]
  (let [r (read)
        lo (max 1 (- r 45))]
    (println (if (some #(= (+ % (ds %)) r) (range lo r)) "YES" "NO"))))
