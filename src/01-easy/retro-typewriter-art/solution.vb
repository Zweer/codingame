Module Solution
    Sub Main()
        Dim line As String = Console.ReadLine()
        Dim sb As New System.Text.StringBuilder()
        For Each tok As String In line.Split(" "c)
            If tok.Length = 0 Then Continue For
            Dim l2 As String = If(tok.Length >= 2, tok.Substring(tok.Length - 2), "")
            Dim ch As String
            Dim num As String
            If l2 = "nl" Then
                ch = vbLf : num = tok.Substring(0, tok.Length - 2)
            ElseIf l2 = "sp" Then
                ch = " " : num = tok.Substring(0, tok.Length - 2)
            ElseIf l2 = "bS" Then
                ch = "\" : num = tok.Substring(0, tok.Length - 2)
            ElseIf l2 = "sQ" Then
                ch = "'" : num = tok.Substring(0, tok.Length - 2)
            Else
                ch = tok.Substring(tok.Length - 1) : num = tok.Substring(0, tok.Length - 1)
            End If
            Dim n As Integer = If(num.Length = 0, 1, Math.Max(1, CInt(num)))
            For i = 1 To n : sb.Append(ch) : Next
        Next
        Console.WriteLine(sb.ToString())
    End Sub
End Module