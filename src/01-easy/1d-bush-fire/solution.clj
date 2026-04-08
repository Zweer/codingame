(ns Solution (:gen-class))
(defn solve [s]
  (loop [j 0 d 0]
    (if (>= j (count s)) d
      (if (= (nth s j) \f) (recur (+ j 3) (inc d)) (recur (inc j) d)))))
(defn -main [& _]
  (let [n (Integer/parseInt (read-line))]
    (dotimes [_ n] (println (solve (read-line))))))
