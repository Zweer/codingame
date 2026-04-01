package main

import (
	"bufio"
	"fmt"
	"os"
	"strings"
)

func main() {
	scanner := bufio.NewScanner(os.Stdin)
	scanner.Scan()
	msg := scanner.Text()
	var bin strings.Builder
	for _, c := range msg {
		bin.WriteString(fmt.Sprintf("%07b", c))
	}
	s := bin.String()
	var parts []string
	i := 0
	for i < len(s) {
		cur := s[i]
		count := 0
		for i < len(s) && s[i] == cur {
			count++
			i++
		}
		prefix := "0"
		if cur == '0' {
			prefix = "00"
		}
		parts = append(parts, prefix+" "+strings.Repeat("0", count))
	}
	fmt.Println(strings.Join(parts, " "))
}
