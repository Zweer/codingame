Module Solution
    Sub Main()
        Dim n As Integer = CInt(Console.ReadLine())
        Dim h(n - 1) As Integer
        For i As Integer = 0 To n - 1
            h(i) = CInt(Console.ReadLine())
        Next
        Array.Sort(h)
        Dim m As Integer = h(1) - h(0)
        For i As Integer = 1 To n - 2
            Dim d As Integer = h(i + 1) - h(i)
            If d < m Then m = d
        Next
        Console.WriteLine(m)
    End Sub
End Module
