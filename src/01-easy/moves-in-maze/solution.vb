Module Solution
    Sub Main()
        Dim C As String = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"
        Dim p = Console.ReadLine().Split(" "c)
        Dim w = CInt(p(0)), h = CInt(p(1))
        Dim g(h-1) As String
        Dim d(h-1, w-1) As Integer
        For i = 0 To h-1 : g(i) = Console.ReadLine() : For j = 0 To w-1 : d(i,j) = -1 : Next : Next
        Dim sr = 0, sc = 0
        For r = 0 To h-1 : For c = 0 To w-1 : If g(r)(c) = "S"c Then sr = r : sc = c : Next : Next
        d(sr, sc) = 0
        Dim q As New Queue(Of Tuple(Of Integer, Integer))
        q.Enqueue(Tuple.Create(sr, sc))
        Dim dr = {0, 0, 1, -1}, dc = {1, -1, 0, 0}
        While q.Count > 0
            Dim pt = q.Dequeue() : Dim r = pt.Item1, c = pt.Item2
            For i = 0 To 3
                Dim nr = (r+dr(i)+h) Mod h, nc = (c+dc(i)+w) Mod w
                If g(nr)(nc) <> "#"c AndAlso d(nr, nc) = -1 Then d(nr, nc) = d(r, c)+1 : q.Enqueue(Tuple.Create(nr, nc))
            Next
        End While
        For r = 0 To h-1
            Dim sb As New System.Text.StringBuilder()
            For c = 0 To w-1
                If g(r)(c) = "#"c Then sb.Append("#"c) ElseIf d(r,c) = -1 Then sb.Append("."c) Else sb.Append(C(d(r,c)))
            Next
            Console.WriteLine(sb.ToString())
        Next
    End Sub
End Module
