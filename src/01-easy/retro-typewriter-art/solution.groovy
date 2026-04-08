s = new Scanner(System.in)
def ab = [sp: ' ', bS: '\\', sQ: "'", nl: '\n']
def line = s.nextLine()
def out = new StringBuilder()
line.split(' ').each { tok ->
    def l2 = tok.length() >= 2 ? tok[-2..-1] : ''
    def ch, num
    if (ab.containsKey(l2)) { ch = ab[l2]; num = tok[0..<(tok.length()-2)] }
    else { ch = tok[-1]; num = tok[0..<(tok.length()-1)] }
    int n = num.isEmpty() ? 1 : Math.max(1, num.toInteger())
    n.times { out.append(ch) }
}
println out
