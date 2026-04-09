Module Solution
    Sub Main()
        Dim chars As String = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"
        Dim p = Console.ReadLine().Split(" "c)
        Dim w = CInt(p(0)), h = CInt(p(1))
        Dim g(h-1) As String
        Dim d(h-1, w-1) As Integer
        For i = 0 To h-1
            g(i) = Console.ReadLine()
            For j = 0 To w-1
                d(i,j) = -1
            Next
        Next
        Dim sr = 0, sc = 0
        For r = 0 To h-1
            For c2 = 0 To w-1
                If g(r)(c2) = "S"c Then
                    sr = r
                    sc = c2
                End If
            Next
        Next
        d(sr, sc) = 0
        Dim q As New Queue(Of Tuple(Of Integer, Integer))
        q.Enqueue(Tuple.Create(sr, sc))
        Dim dr = {0, 0, 1, -1}, dc = {1, -1, 0, 0}
        While q.Count > 0
            Dim pt = q.Dequeue()
            Dim cr = pt.Item1, cc = pt.Item2
            For i = 0 To 3
                Dim nr = (cr+dr(i)+h) Mod h, nc = (cc+dc(i)+w) Mod w
                If g(nr)(nc) <> "#"c AndAlso d(nr, nc) = -1 Then
                    d(nr, nc) = d(cr, cc)+1
                    q.Enqueue(Tuple.Create(nr, nc))
                End If
            Next
        End While
        For r = 0 To h-1
            Dim sb As New System.Text.StringBuilder()
            For c2 = 0 To w-1
                If g(r)(c2) = "#"c Then
                    sb.Append("#"c)
                ElseIf d(r,c2) = -1 Then
                    sb.Append("."c)
                Else
                    sb.Append(chars(d(r,c2)))
                End If
            Next
            Console.WriteLine(sb.ToString())
        Next
    End Sub
End Module