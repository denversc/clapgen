const clapgen = clapgen_init({configVersion: 1});

const fooArg = clapgen.addArgument("foo");
fooArg.name = "baz"

clapgen.addArgument("bar");
