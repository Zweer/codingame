package main
import (
	"bufio"
	"fmt"
	"os"
	"strings"
)
func main() {
	r := bufio.NewReader(os.Stdin)
	var n, q int
	fmt.Fscan(r, &n, &q)
	r.ReadString('\n')
	m := map[string]string{}
	for i := 0; i < n; i++ {
		var ext, mt string
		fmt.Fscan(r, &ext, &mt)
		m[strings.ToLower(ext)] = mt
	}
	r.ReadString('\n')
	for i := 0; i < q; i++ {
		f, _ := r.ReadString('\n')
		f = strings.TrimRight(f, "\r\n")
		dot := strings.LastIndex(f, ".")
		if dot == -1 {
			fmt.Println("UNKNOWN")
		} else {
			ext := strings.ToLower(f[dot+1:])
			if mt, ok := m[ext]; ok {
				fmt.Println(mt)
			} else {
				fmt.Println("UNKNOWN")
			}
		}
	}
}
