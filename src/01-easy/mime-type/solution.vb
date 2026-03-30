Module Solution
    Sub Main()
        Dim n As Integer = CInt(Console.ReadLine())
        Dim q As Integer = CInt(Console.ReadLine())
        Dim m As New Dictionary(Of String, String)
        For i As Integer = 0 To n - 1
            Dim p() As String = Console.ReadLine().Split(" "c)
            m(p(0).ToLower()) = p(1)
        Next
        For i As Integer = 0 To q - 1
            Dim f As String = Console.ReadLine()
            Dim dot As Integer = f.LastIndexOf("."c)
            If dot = -1 Then
                Console.WriteLine("UNKNOWN")
            Else
                Dim ext As String = f.Substring(dot + 1).ToLower()
                If m.ContainsKey(ext) Then
                    Console.WriteLine(m(ext))
                Else
                    Console.WriteLine("UNKNOWN")
                End If
            End If
        Next
    End Sub
End Module
