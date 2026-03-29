Module Solution
    Sub Main()
        Do
            Dim max As Integer = -1
            Dim idx As Integer = 0
            For i As Integer = 0 To 7
                Dim h As Integer = CInt(Console.ReadLine())
                If h > max Then max = h : idx = i
            Next
            Console.WriteLine(idx)
        Loop
    End Sub
End Module
