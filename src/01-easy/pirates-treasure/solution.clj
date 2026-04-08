(ns Solution (:gen-class))
(defn -main [& _]
  (let [w (Integer/parseInt (read-line)) h (Integer/parseInt (read-line))
        g (vec (for [_ (range h)] (vec (map #(Integer/parseInt %) (.split (read-line) " ")))))
        dx [-1 -1 -1 0 0 1 1 1] dy [-1 0 1 -1 1 -1 0 1]]
    (doseq [y (range h) x (range w) :when (= (get-in g [y x]) 0)]
      (when (every? (fn [i] (let [nx (+ x (dx i)) ny (+ y (dy i))]
              (or (< nx 0) (>= nx w) (< ny 0) (>= ny h) (= (get-in g [ny nx]) 1)))) (range 8))
        (println (str x " " y)) (System/exit 0)))))
