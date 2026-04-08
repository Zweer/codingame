Module Solution
    Sub Main()
        Dim w=CInt(Console.ReadLine()),h=CInt(Console.ReadLine())
        Dim g(h-1,w-1) As Integer
        For y=0 To h-1:Dim r=Console.ReadLine().Split(" "c):For x=0 To w-1:g(y,x)=CInt(r(x)):Next:Next
        Dim dx={-1,-1,-1,0,0,1,1,1},dy={-1,0,1,-1,1,-1,0,1}
        For y=0 To h-1:For x=0 To w-1:If g(y,x)=0 Then
            Dim ok=True
            For i=0 To 7:Dim nx=x+dx(i),ny=y+dy(i)
                If nx>=0 AndAlso nx<w AndAlso ny>=0 AndAlso ny<h AndAlso g(ny,nx)<>1 Then ok=False
            Next
            If ok Then Console.WriteLine(x & " " & y):End
        End If:Next:Next
    End Sub
End Module
