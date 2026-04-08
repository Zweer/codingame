(ns Solution (:gen-class))
(defn ds [n] (reduce + (map #(- (int %) 48) (str n))))
(defn -main [& args]
  (loop [r1 (read) r2 (read)]
    (cond
      (= r1 r2) (println r1)
      (< r1 r2) (recur (+ r1 (ds r1)) r2)
      :else (recur r1 (+ r2 (ds r2))))))
