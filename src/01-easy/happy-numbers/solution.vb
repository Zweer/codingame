Module Solution
    Function Dss(n As Integer) As Integer
        Dim s As Integer = 0
        While n > 0
            Dim d As Integer = n Mod 10 : s += d*d : n \= 10
        End While
        Return s
    End Function
    Sub Main()
        Dim n As Integer = CInt(Console.ReadLine())
        For i As Integer = 1 To n
            Dim s As String = Console.ReadLine().Trim()
            Dim x As Integer = 0
            For Each c As Char In s
                Dim d As Integer = Asc(c) - 48 : x += d*d
            Next
            Dim seen As New HashSet(Of Integer)
            While x <> 1 AndAlso seen.Add(x)
                x = Dss(x)
            End While
            Console.WriteLine(s & If(x = 1, " :)", " :("))
        Next
    End Sub
End Module
