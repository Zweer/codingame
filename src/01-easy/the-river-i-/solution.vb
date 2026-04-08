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
        Dim r1 As Long = Long.Parse(Console.ReadLine())
        Dim r2 As Long = Long.Parse(Console.ReadLine())
        While r1 <> r2
            If r1 < r2 Then r1 += Ds(r1) Else r2 += Ds(r2)
        End While
        Console.WriteLine(r1)
    End Sub
End Module
