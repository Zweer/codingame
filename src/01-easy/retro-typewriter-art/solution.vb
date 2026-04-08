Module Solution
    Sub Main()
        Dim ab As New Dictionary(Of String, Char) From {{"sp"c, " "c}, {"bS", "\"c}, {"sQ", "'"c}, {"nl", Chr(10)}}
        Dim line As String = Console.ReadLine()
        Dim sb As New System.Text.StringBuilder()
        For Each tok As String In line.Split(" "c)
            Dim l2 As String = If(tok.Length >= 2, tok.Substring(tok.Length - 2), "")
            Dim ch As Char
            Dim num As String
            If ab.ContainsKey(l2) Then
                ch = ab(l2) : num = tok.Substring(0, tok.Length - 2)
            Else
                ch = tok(tok.Length - 1) : num = tok.Substring(0, tok.Length - 1)
            End If
            Dim n As Integer = If(num.Length = 0, 1, Math.Max(1, CInt(num)))
            sb.Append(New String(ch, n))
        Next
        Console.WriteLine(sb.ToString())
    End Sub
End Module
