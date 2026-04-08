(ns Solution (:gen-class)
  (:require [clojure.string :as str]))
(defn -main [& args]
  (let [L (Integer/parseInt (read-line))
        H (Integer/parseInt (read-line))
        T (str/upper-case (read-line))
        rows (vec (repeatedly H read-line))]
    (doseq [i (range H)]
      (println
        (apply str
          (map (fn [c]
                 (let [idx (- (int c) 65)
                       idx (if (or (< idx 0) (> idx 25)) 26 idx)]
                   (subs (rows i) (* idx L) (+ (* idx L) L))))
               T))))))
