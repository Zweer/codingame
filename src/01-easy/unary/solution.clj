(ns Solution (:gen-class)
  (:require [clojure.string :as str]))
(defn -main [& args]
  (let [msg (read-line)
        bin (apply str
              (map (fn [c]
                     (let [b (Integer/toBinaryString (int c))
                           p (- 7 (.length b))]
                       (str (apply str (repeat p \0)) b)))
                   msg))
        groups (partition-by identity bin)
        parts (map (fn [g]
                     (str (if (= (first g) \1) "0" "00")
                          " "
                          (apply str (repeat (count g) \0))))
                   groups)]
    (println (str/join " " parts))))
