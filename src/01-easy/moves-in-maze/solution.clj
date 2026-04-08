(ns Solution (:gen-class) (:import [java.util LinkedList]))
(defn -main [& _]
  (let [C "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"
        [w h] (map #(Integer/parseInt %) (.split (read-line) " "))
        g (vec (for [_ (range h)] (read-line)))
        d (to-array-2d (vec (for [_ (range h)] (vec (repeat w -1)))))
        [sr sc] (first (for [r (range h) c (range w) :when (= (nth (g r) c) \S)] [r c]))
        q (LinkedList.)]
    (aset d sr sc (int 0))
    (.add q [sr sc])
    (while (not (.isEmpty q))
      (let [[r c] (.poll q)]
        (doseq [[dr dc] [[0 1][0 -1][1 0][-1 0]]]
          (let [nr (mod (+ r dr h) h) nc (mod (+ c dc w) w)]
            (when (and (not= (nth (g nr) nc) \#) (= (aget d nr nc) -1))
              (aset d nr nc (int (+ (aget d r c) 1)))
              (.add q [nr nc]))))))
    (doseq [r (range h)]
      (println (apply str (for [c (range w)]
        (let [ch (nth (g r) c) v (aget d r c)]
          (cond (= ch \#) \# (= v -1) \. :else (nth C v)))))))))
