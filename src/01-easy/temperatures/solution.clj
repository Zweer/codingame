(ns Solution
  (:gen-class))
(defn closer [a b]
  (let [aa (Math/abs (int a)) ab (Math/abs (int b))]
    (cond
      (< ab aa) b
      (and (= ab aa) (pos? b)) b
      :else a)))
(defn -main [& args]
  (let [n (Integer/parseInt (read-line))]
    (if (zero? n) (println 0)
      (let [t (map #(Integer/parseInt %) (.split (.trim (read-line)) " "))]
        (println (reduce closer t))))))
