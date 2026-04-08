Imports System
Module Solution
    Sub Main()
        Dim L As Integer=Integer.Parse(Console.ReadLine()),H As Integer=Integer.Parse(Console.ReadLine())
        Dim T As String=Console.ReadLine().ToUpper()
        Dim rows(H-1) As String
        For i As Integer=0 To H-1:rows(i)=Console.ReadLine():Next
        For i As Integer=0 To H-1
            Dim line As String=""
            For Each c As Char In T
                Dim idx As Integer=Asc(c)-65:If idx<0 Or idx>25 Then idx=26
                line &= rows(i).Substring(idx*L,L)
            Next
            Console.WriteLine(line)
        Next
    End Sub
End Module
