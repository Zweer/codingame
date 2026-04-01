def br = new BufferedReader(new InputStreamReader(System.in))
def bw = new BufferedWriter(new OutputStreamWriter(System.out))
int n = br.readLine().trim() as int
int q = br.readLine().trim() as int
HashMap<String,String> m = new HashMap<>(n * 2)
for (int i = 0; i < n; i++) {
    String line = br.readLine()
    int sp = line.indexOf(' ')
    m.put(line.substring(0, sp).toLowerCase(), line.substring(sp + 1))
}
for (int i = 0; i < q; i++) {
    String f = br.readLine()
    int dot = f.lastIndexOf('.')
    if (dot == -1) { bw.write('UNKNOWN') } 
    else {
        String ext = f.substring(dot + 1).toLowerCase()
        String r = m.get(ext)
        bw.write(r != null ? r : 'UNKNOWN')
    }
    bw.newLine()
}
bw.flush()
