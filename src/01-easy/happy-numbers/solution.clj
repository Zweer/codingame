(ns Solution
  (:gen-class))
(defn dss [n]
  (loop [x n s 0]
    (if (zero? x) s
      (let [d (mod x 10)] (recur (quot x 10) (+ s (* d d)))))))
(defn happy? [x]
  (loop [x x seen #{}]
    (cond (= x 1) true
          (seen x) false
          :else (recur (dss x) (conj seen x)))))
(defn -main [& _]
  (let [n (Integer/parseInt (read-line))]
    (dotimes [_ n]
      (let [s (read-line)
            x (reduce + (map #(let [d (- (int %) 48)] (* d d)) s))]
        (println (str s (if (happy? x) " :)" " :(")))))))
