(ns Solution
  (:gen-class))
(defn -main []
  (loop []
    (let [heights (map #(Integer/parseInt (read-line)) (range 8))
          idx (.indexOf heights (apply max heights))]
      (println idx))
    (recur)))
