package main
import "fmt"
func main() {
    for {
        max, idx := -1, 0
        for i := 0; i < 8; i++ {
            var h int
            fmt.Scan(&h)
            if h > max { max = h; idx = i }
        }
        fmt.Println(idx)
    }
}
