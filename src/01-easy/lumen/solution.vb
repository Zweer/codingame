Module Solution
    Sub Main()
        Dim n=CInt(Console.ReadLine()),l=CInt(Console.ReadLine())
        Dim g(n-1)() As String
        For i=0 To n-1:g(i)=Console.ReadLine().Split(" "c):Next
        Dim d=0
        For r=0 To n-1:For c=0 To n-1
            Dim lit=False
            For r2=0 To n-1:For c2=0 To n-1
                If g(r2)(c2)="C" AndAlso Math.Max(Math.Abs(r-r2),Math.Abs(c-c2))<l Then lit=True
            Next:Next
            If Not lit Then d+=1
        Next:Next
        Console.WriteLine(d)
    End Sub
End Module
