Module Answer
    Sub Main()
        Dim n = CInt(Console.ReadLine())
        If n = 0 Then
            Console.WriteLine(0)
            Return
        End If
        Dim t = Console.ReadLine().Split(" "c)
        Dim r = CInt(t(0))
        For Each s In t
            Dim v = CInt(s)
            If Math.Abs(v) < Math.Abs(r) OrElse (Math.Abs(v) = Math.Abs(r) AndAlso v > 0) Then r = v
        Next
        Console.WriteLine(r)
    End Sub
End Module
