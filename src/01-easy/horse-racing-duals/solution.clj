(ns Solution
  (:gen-class))
(defn -main [& args]
  (let [n (Integer/parseInt (read-line))
        h (sort (vec (for [_ (range n)] (Integer/parseInt (read-line)))))]
    (println (apply min (map - (rest h) h)))))
