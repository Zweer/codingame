Module Player
    Sub Main()
        Dim s = Console.ReadLine().Split(" "c)
        Dim lx = CInt(s(0)), ly = CInt(s(1))
        Dim tx = CInt(s(2)), ty = CInt(s(3))
        Do
            Console.ReadLine()
            Dim dir = ""
            If ty > ly Then dir &= "N" : ty -= 1
            ElseIf ty < ly Then dir &= "S" : ty += 1
            End If
            If tx > lx Then dir &= "W" : tx -= 1
            ElseIf tx < lx Then dir &= "E" : tx += 1
            End If
            Console.WriteLine(dir)
        Loop
    End Sub
End Module
