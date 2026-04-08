Imports System
Module Solution
    Sub Main()
        Dim msg As String = Console.ReadLine()
        Dim bin As String = ""
        For Each c As Char In msg
            bin &= Convert.ToString(Asc(c), 2).PadLeft(7, "0"c)
        Next
        Dim parts As New List(Of String)
        Dim i As Integer = 0
        While i < bin.Length
            Dim cur As Char = bin(i)
            Dim count As Integer = 0
            While i < bin.Length AndAlso bin(i) = cur
                count += 1
                i += 1
            End While
            parts.Add(If(cur = "1"c, "0", "00") & " " & New String("0"c, count))
        End While
        Console.WriteLine(String.Join(" ", parts))
    End Sub
End Module
