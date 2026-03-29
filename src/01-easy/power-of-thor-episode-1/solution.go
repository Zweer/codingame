package main
import "fmt"
func main() {
    var lx, ly, tx, ty, e int
    fmt.Scan(&lx, &ly, &tx, &ty)
    for {
        fmt.Scan(&e)
        dir := ""
        if ty > ly { dir += "N"; ty-- } else if ty < ly { dir += "S"; ty++ }
        if tx > lx { dir += "W"; tx-- } else if tx < lx { dir += "E"; tx++ }
        fmt.Println(dir)
    }
}
