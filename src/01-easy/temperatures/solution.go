package main
import (
    "fmt"
    "math"
)
func main() {
    var n int
    fmt.Scan(&n)
    if n == 0 { fmt.Println(0); return }
    r := 0.0
    for i := 0; i < n; i++ {
        var v int
        fmt.Scan(&v)
        vf := float64(v)
        if i == 0 || math.Abs(vf) < math.Abs(r) || (math.Abs(vf) == math.Abs(r) && vf > 0) { r = vf }
    }
    fmt.Println(int(r))
}
