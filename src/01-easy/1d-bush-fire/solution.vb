Module Solution
    Sub Main()
        Dim n As Integer = CInt(Console.ReadLine())
        For i As Integer = 1 To n
            Dim s As String = Console.ReadLine().Trim()
            Dim d As Integer = 0, j As Integer = 0
            While j < s.Length
                If s(j) = "f"c Then d += 1 : j += 3 Else j += 1
            End While
            Console.WriteLine(d)
        Next
    End Sub
End Module
