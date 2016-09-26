process.chdir(__dirname);
let argv = require("optimist").argv,
    file = argv["_"],
    config = argv["c"] ? argv['c'] : argv["config"],
    tslint = require("tslint"),
    ts = require("typescript"),
    fs = require("fs"),
    path = require("path");

const configuration = {
    "extends": ["tslint:latest"],
    "rules": {
        "member-access": [true, "check-accessor"],
        "member-ordering": [true, { "order": "fields-first" }],
        "no-any": true,
        "no-inferrable-types": false,
        "no-internal-module": true,
        "no-namespace": true,
        "no-reference": true,
        "no-var-requires": true,
        "only-arrow-functions": false,
        "typedef": [true, "call-signature", "member-variable-declaration", "property-declaration", "variable-declaration", "member-variable-declaration"],
        "typedef-whitespace": [
            true,
            {
                "call-signature": "nospace",
                "index-signature": "nospace",
                "parameter": "nospace",
                "property-declaration": "nospace",
                "variable-declaration": "nospace"
            },
            {
                "call-signature": "onespace",
                "index-signature": "onespace",
                "parameter": "onespace",
                "property-declaration": "onespace",
                "variable-declaration": "onespace"
            }
        ],
        "curly": true,
        "forin": true,
        "label-position": true,
        "no-arg": true,
        "no-bitwise": false,
        "no-conditional-assignment": true,
        "no-console": false,
        "no-construct": true,
        "no-debugger": false,
        "no-duplicate-variable": true,
        "no-empty": true,
        "no-eval": true,
        "no-for-in-array": true,
        "no-invalid-this": true,
        "no-null-keyword": false,
        "no-shadowed-variable": true,
        "no-string-literal": true,
        "no-switch-case-fall-through": true,
        "no-unreachable": true,
        "no-unsafe-finally": true,
        "no-unused-expression": true,
        "no-unused-new": true,
        "no-unused-variable": [true, "react"],
        "no-use-before-declare": true,
        "no-var-keyword": true,
        "radix": false,
        "restrict-plus-operands": false,
        "switch-default": false,
        "triple-equals": [true, "allow-null-check"],
        "use-isnan": true,
        "use-strict": [false],
        "eofline": true,
        "indent": [true, "spaces"],
        "linebreak-style": [true, "CRLF"],
        "max-file-line-count": [false],
        "no-default-export": false,
        "no-mergeable-namespace": true,
        "no-require-imports": true,
        "no-trailing-whitespace": true,
        "object-literal-sort-keys": true,
        "trailing-comma": [true, {"multiline": "never", "singleline": "never"}],
        "arrow-parens": true,
        "class-name": true,
        "comment-format": [true, "check-space", "check-uppercase"],
        "interface-name": [true, "always-prefix"],
        "jsdoc-format": true,
        "new-parens": true,
        "no-angle-bracket-type-assertion": true,
        "no-consecutive-blank-lines": false,
        "object-literal-key-quotes": [true, "always"],
        "one-line": [true, "check-catch", "check-finally", "check-else", "check-open-brace", "check-whitespace"],
        "one-variable-per-declaration": false,
        "ordered-imports": [true, {"named-imports-order": "lowercase-first"}],
        "quotemark": [true, "single", "jsx-double", "avoid-escape"],
        "semicolon": [true, "always"],
        "variable-name": [true, "ban-keywords", "check-format"],
        "whitespace": [true, "check-branch", "check-decl", "check-module", "check-operator", "check-separator", "check-type", "check-typecast"]
    }
};

function createProgram(configFile) {
    var projectDirectory;
    const lastSeparator = configFile.lastIndexOf("/");
    if (lastSeparator < 0) {
        projectDirectory = ".";
    } else {
        projectDirectory = configFile.substring(0, lastSeparator + 1);
    }

    const {config} = ts.readConfigFile(configFile, ts.sys.readFile);
    const parsed = ts.parseJsonConfigFileContent(config, {readDirectory: ts.sys.readDirectory}, projectDirectory);
    const host = ts.createCompilerHost(parsed.options, true);
    parsed.options.rootDir = __dirname;
    const program = ts.createProgram(parsed.fileNames, parsed.options, host);
    return program;
}

const options = {
    formatter: "json",
    configuration: configuration
};
const program = tslint.createProgram("./tsconfig.json");
const files = tslint.getFileNames(program);
const results = files.map(file => {
    const fileContents = program.getSourceFile(file).getFullText();
    const linter = new tslint(file, fileContents, options, program);
    return linter.lint();
});

let jsonString = null;

for (let result of results) {
    for (let output of JSON.parse(result.output)) {
        let rel = path.relative(__dirname, file[0]);
        rel = rel.replace(/\\/g,"/");
        if (output.name === rel) {
            jsonString = result.output;
        }
    }
}

console.log(jsonString);
