function clapgen_init() {
    if (arguments.length === 0) {
        throw new Error("expected exactly 1 argument, but got 0");
    } else if (arguments.length > 0) {
        throw new Error(`expected exactly 1 argument, but got ${arguments.length}`);
    }

    const options = arguments[0]
}