(ns Solution
  (:gen-class)
  (:require [clojure.string :as str]))
(defn -main [& args]
  (let [n (Integer/parseInt (read-line))
        q (Integer/parseInt (read-line))
        m (into {} (for [_ (range n)
                         :let [p (str/split (read-line) #" ")]]
                     [(.toLowerCase (first p)) (second p)]))]
    (dotimes [_ q]
      (let [f (read-line)
            dot (.lastIndexOf f ".")]
        (if (= dot -1)
          (println "UNKNOWN")
          (println (get m (.toLowerCase (.substring f (inc dot))) "UNKNOWN")))))))
