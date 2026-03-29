(ns Player
  (:gen-class))
(defn -main [& args]
  (while true
    (let [heights (vec (for [_ (range 8)] (Integer/parseInt (read-line))))
          mx (apply max heights)
          idx (.indexOf heights mx)]
      (println idx))))
