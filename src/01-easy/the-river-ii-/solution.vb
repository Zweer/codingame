Imports System
Module Solution
    Function Ds(ByVal n As Long) As Long
        Dim s As Long = 0
        While n > 0
            s += n Mod 10
            n = n \ 10
        End While
        Return s
    End Function
    Sub Main()
        Dim r As Long = Long.Parse(Console.ReadLine())
        Dim lo As Long = Math.Max(1, r - 45)
        For x As Long = lo To r - 1
            If x + Ds(x) = r Then
                Console.WriteLine("YES")
                Return
            End If
        Next
        Console.WriteLine("NO")
    End Sub
End Module
