(ns Solution
  (:require [clojure.string :as str]))
(let [msg (read-line)
      bin (apply str (map #(format "%7s" (Integer/toBinaryString (int %)))
                          msg))
      bin (str/replace bin " " "0")
      groups (partition-by identity bin)]
  (println
    (str/join " "
      (map (fn [g]
             (str (if (= (first g) \1) "0" "00") " " (apply str (repeat (count g) "0"))))
           groups))))
