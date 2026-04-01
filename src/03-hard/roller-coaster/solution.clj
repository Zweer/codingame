(ns Solution
  (:gen-class))

(defn -main [& args]
  (let [[L C N] (map #(Long/parseLong %) (.split (read-line) " "))
        groups (vec (repeatedly N #(Long/parseLong (read-line))))
        ;; For each starting head position, compute (next-head, earned)
        sim (fn [head]
              (loop [cap L earned 0 idx head cnt 0]
                (if (or (>= cnt N) (> (groups idx) cap))
                  [idx earned]
                  (recur (- cap (groups idx))
                         (+ earned (groups idx))
                         (mod (inc idx) N)
                         (inc cnt)))))
        ;; Precompute transitions for all N positions
        transitions (vec (map sim (range N)))]
    (loop [rides 0 head 0 total 0 memo {}]
      (if (>= rides C)
        (println total)
        (if (contains? memo head)
          (let [[prev-rides prev-total] (memo head)
                cycle-len (- rides prev-rides)
                cycle-earn (- total prev-total)
                remaining (- C rides)
                full-cycles (quot remaining cycle-len)
                new-total (+ total (* full-cycles cycle-earn))
                new-rides (+ rides (* full-cycles cycle-len))]
            ;; Simulate remaining
            (loop [r new-rides h head t new-total]
              (if (>= r C)
                (println t)
                (let [[nh earned] (transitions h)]
                  (recur (inc r) nh (+ t earned))))))
          (let [[nh earned] (transitions head)]
            (recur (inc rides) nh (+ total earned)
                   (assoc memo head [rides total]))))))))
