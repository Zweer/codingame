(ns Player
  (:gen-class))
(defn -main [& args]
  (let [n (Integer/parseInt (read-line))]
    (if (zero? n) (println 0)
      (let [t (map #(Integer/parseInt %) (.split (.trim (read-line)) " "))
            closer (fn [a b] (if (or (< (Math/abs b) (Math/abs a))
                                     (and (= (Math/abs b) (Math/abs a)) (pos? b))) b a))]
        (println (reduce closer t))))))
