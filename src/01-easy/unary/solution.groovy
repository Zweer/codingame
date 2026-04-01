def msg = new BufferedReader(new InputStreamReader(System.in)).readLine()
def bin = msg.collect { String.format('%07d', new BigInteger(Integer.toBinaryString((int)it))) }.join()
def parts = []
int i = 0
while (i < bin.length()) {
    char cur = bin.charAt(i)
    int count = 0
    while (i < bin.length() && bin.charAt(i) == cur) { count++; i++ }
    parts << "${cur == '1' as char ? '0' : '00'} ${'0' * count}"
}
println parts.join(' ')
