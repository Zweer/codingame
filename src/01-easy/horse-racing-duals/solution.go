package main
import (
	"fmt"
	"sort"
)
func main() {
	var n int
	fmt.Scan(&n)
	h := make([]int, n)
	for i := range h { fmt.Scan(&h[i]) }
	sort.Ints(h)
	min := h[1] - h[0]
	for i := 1; i < n-1; i++ {
		if d := h[i+1] - h[i]; d < min { min = d }
	}
	fmt.Println(min)
}
