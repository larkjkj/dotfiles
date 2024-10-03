class BrightService extends Service {
    static {
        Service.register(
            this, {
                'sc-changed': ['float'],
            },
            {
                'sc-value': ['float', 'rw']
            }
        );
    }

    #interface = Utils.exec("sh -c 'ls -w1 /sys/class/backlight | head -1'");

    #scvalue = 0;
    #max = Number(Utils.exec('brightnessctl max'));

    get sc_value() {
        return this.#scvalue;
    }

    set sc_value(percent) {
        if (percent < 0)
                percent = 0;
        if (percent > 1)
                percent = 1;
        
        Utils.execAsync(`brightnessctl set ${percent * 100}% -q`)
    }

    constructor() {
        super();

        const backlight = `/sys/class/backlight/${this.#interface}/brightness`;
        Utils.monitorFile(backlight, () => this.#on_change());

        this.#on_change();
    }

    #on_change() {
        this.#scvalue = Number(Utils.exec('brightnessctl get')) / this.#max

        this.emit('changed')
        this.notify('sc-value')
        this.emit('sc-changed', this.#scvalue) 
    }
    connect(event = 'sc-changed', callback) {
        return super.connect(event, callback)
    }
}

const service = new BrightService;

export default service
