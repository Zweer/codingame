class Game {
    count: number;
    template: string = '';

    constructor() {
        this.count = parseInt(readline(), 10);
        console.error('count:', this.count);
        for (let i = 0; i < this.count; i++) {
            const template = readline();
            console.error('template', i, template);
            this.template = `${this.template}\n${template}`.trimStart();
        }
        console.error('template:');
        console.error(this.template);
        console.error('\n\n');
    }

    solve() {
        let index = 0;
        console.log(this.template.replace(/\(([^)]*)\)/g, (_: string, p1: string) => {
            const options = p1.split('|');
            return options[index++ % options.length];
        }));
    }
}

new Game().solve();
