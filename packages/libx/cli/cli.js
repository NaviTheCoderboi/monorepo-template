import { $import, removeEmptyValues, getLeastCommonAncestor, logger_default, onSigInt, formatAnalysis, getHash, getPathInOutdir, modifyRawJson } from './chunk-YK64LOK6.js';
import { loadConfig } from './chunk-MAQGZGEA.js';
import { EventEmitter } from 'events';
import fs from 'node:fs/promises';
import path from 'node:path';
import { globby } from 'globby';
import { Worker } from 'node:worker_threads';

function toArr(any) {
  return any == null ? [] : Array.isArray(any) ? any : [any];
}
function toVal(out, key, val, opts) {
  var x, old = out[key], nxt = !!~opts.string.indexOf(key) ? val == null || val === true ? "" : String(val) : typeof val === "boolean" ? val : !!~opts.boolean.indexOf(key) ? val === "false" ? false : val === "true" || (out._.push((x = +val, x * 0 === 0) ? x : val), !!val) : (x = +val, x * 0 === 0) ? x : val;
  out[key] = old == null ? nxt : Array.isArray(old) ? old.concat(nxt) : [old, nxt];
}
function mri2(args, opts) {
  args = args || [];
  opts = opts || {};
  var k, arr, arg, name, val, out = { _: [] };
  var i = 0, j = 0, idx = 0, len = args.length;
  const alibi = opts.alias !== void 0;
  const strict = opts.unknown !== void 0;
  const defaults = opts.default !== void 0;
  opts.alias = opts.alias || {};
  opts.string = toArr(opts.string);
  opts.boolean = toArr(opts.boolean);
  if (alibi) {
    for (k in opts.alias) {
      arr = opts.alias[k] = toArr(opts.alias[k]);
      for (i = 0; i < arr.length; i++) {
        (opts.alias[arr[i]] = arr.concat(k)).splice(i, 1);
      }
    }
  }
  for (i = opts.boolean.length; i-- > 0; ) {
    arr = opts.alias[opts.boolean[i]] || [];
    for (j = arr.length; j-- > 0; ) opts.boolean.push(arr[j]);
  }
  for (i = opts.string.length; i-- > 0; ) {
    arr = opts.alias[opts.string[i]] || [];
    for (j = arr.length; j-- > 0; ) opts.string.push(arr[j]);
  }
  if (defaults) {
    for (k in opts.default) {
      name = typeof opts.default[k];
      arr = opts.alias[k] = opts.alias[k] || [];
      if (opts[name] !== void 0) {
        opts[name].push(k);
        for (i = 0; i < arr.length; i++) {
          opts[name].push(arr[i]);
        }
      }
    }
  }
  const keys = strict ? Object.keys(opts.alias) : [];
  for (i = 0; i < len; i++) {
    arg = args[i];
    if (arg === "--") {
      out._ = out._.concat(args.slice(++i));
      break;
    }
    for (j = 0; j < arg.length; j++) {
      if (arg.charCodeAt(j) !== 45) break;
    }
    if (j === 0) {
      out._.push(arg);
    } else if (arg.substring(j, j + 3) === "no-") {
      name = arg.substring(j + 3);
      if (strict && !~keys.indexOf(name)) {
        return opts.unknown(arg);
      }
      out[name] = false;
    } else {
      for (idx = j + 1; idx < arg.length; idx++) {
        if (arg.charCodeAt(idx) === 61) break;
      }
      name = arg.substring(j, idx);
      val = arg.substring(++idx) || (i + 1 === len || ("" + args[i + 1]).charCodeAt(0) === 45 || args[++i]);
      arr = j === 2 ? [name] : name;
      for (idx = 0; idx < arr.length; idx++) {
        name = arr[idx];
        if (strict && !~keys.indexOf(name)) return opts.unknown("-".repeat(j) + name);
        toVal(out, name, idx + 1 < arr.length || val, opts);
      }
    }
  }
  if (defaults) {
    for (k in opts.default) {
      if (out[k] === void 0) {
        out[k] = opts.default[k];
      }
    }
  }
  if (alibi) {
    for (k in out) {
      arr = opts.alias[k] || [];
      while (arr.length > 0) {
        out[arr.shift()] = out[k];
      }
    }
  }
  return out;
}
var removeBrackets = (v) => v.replace(/[<[].+/, "").trim();
var findAllBrackets = (v) => {
  const ANGLED_BRACKET_RE_GLOBAL = /<([^>]+)>/g;
  const SQUARE_BRACKET_RE_GLOBAL = /\[([^\]]+)\]/g;
  const res = [];
  const parse = (match) => {
    let variadic = false;
    let value = match[1];
    if (value.startsWith("...")) {
      value = value.slice(3);
      variadic = true;
    }
    return {
      required: match[0].startsWith("<"),
      value,
      variadic
    };
  };
  let angledMatch;
  while (angledMatch = ANGLED_BRACKET_RE_GLOBAL.exec(v)) {
    res.push(parse(angledMatch));
  }
  let squareMatch;
  while (squareMatch = SQUARE_BRACKET_RE_GLOBAL.exec(v)) {
    res.push(parse(squareMatch));
  }
  return res;
};
var getMriOptions = (options) => {
  const result = { alias: {}, boolean: [] };
  for (const [index, option] of options.entries()) {
    if (option.names.length > 1) {
      result.alias[option.names[0]] = option.names.slice(1);
    }
    if (option.isBoolean) {
      if (option.negated) {
        const hasStringTypeOption = options.some((o, i) => {
          return i !== index && o.names.some((name) => option.names.includes(name)) && typeof o.required === "boolean";
        });
        if (!hasStringTypeOption) {
          result.boolean.push(option.names[0]);
        }
      } else {
        result.boolean.push(option.names[0]);
      }
    }
  }
  return result;
};
var findLongest = (arr) => {
  return arr.sort((a, b) => {
    return a.length > b.length ? -1 : 1;
  })[0];
};
var padRight = (str, length) => {
  return str.length >= length ? str : `${str}${" ".repeat(length - str.length)}`;
};
var camelcase = (input) => {
  return input.replace(/([a-z])-([a-z])/g, (_, p1, p2) => {
    return p1 + p2.toUpperCase();
  });
};
var setDotProp = (obj, keys, val) => {
  let i = 0;
  let length = keys.length;
  let t = obj;
  let x;
  for (; i < length; ++i) {
    x = t[keys[i]];
    t = t[keys[i]] = i === length - 1 ? val : x != null ? x : !!~keys[i + 1].indexOf(".") || !(+keys[i + 1] > -1) ? {} : [];
  }
};
var setByType = (obj, transforms) => {
  for (const key of Object.keys(transforms)) {
    const transform = transforms[key];
    if (transform.shouldTransform) {
      obj[key] = Array.prototype.concat.call([], obj[key]);
      if (typeof transform.transformFunction === "function") {
        obj[key] = obj[key].map(transform.transformFunction);
      }
    }
  }
};
var getFileName = (input) => {
  const m = /([^\\\/]+)$/.exec(input);
  return m ? m[1] : "";
};
var camelcaseOptionName = (name) => {
  return name.split(".").map((v, i) => {
    return i === 0 ? camelcase(v) : v;
  }).join(".");
};
var CACError = class extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
    if (typeof Error.captureStackTrace === "function") {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = new Error(message).stack;
    }
  }
};
var Option = class {
  constructor(rawName, description, config) {
    this.rawName = rawName;
    this.description = description;
    this.config = Object.assign({}, config);
    rawName = rawName.replace(/\.\*/g, "");
    this.negated = false;
    this.names = removeBrackets(rawName).split(",").map((v) => {
      let name = v.trim().replace(/^-{1,2}/, "");
      if (name.startsWith("no-")) {
        this.negated = true;
        name = name.replace(/^no-/, "");
      }
      return camelcaseOptionName(name);
    }).sort((a, b) => a.length > b.length ? 1 : -1);
    this.name = this.names[this.names.length - 1];
    if (this.negated && this.config.default == null) {
      this.config.default = true;
    }
    if (rawName.includes("<")) {
      this.required = true;
    } else if (rawName.includes("[")) {
      this.required = false;
    } else {
      this.isBoolean = true;
    }
  }
};
var processArgs = process.argv;
var platformInfo = `${process.platform}-${process.arch} node-${process.version}`;
var Command = class {
  constructor(rawName, description, config = {}, cli) {
    this.rawName = rawName;
    this.description = description;
    this.config = config;
    this.cli = cli;
    this.options = [];
    this.aliasNames = [];
    this.name = removeBrackets(rawName);
    this.args = findAllBrackets(rawName);
    this.examples = [];
  }
  usage(text) {
    this.usageText = text;
    return this;
  }
  allowUnknownOptions() {
    this.config.allowUnknownOptions = true;
    return this;
  }
  ignoreOptionDefaultValue() {
    this.config.ignoreOptionDefaultValue = true;
    return this;
  }
  version(version, customFlags = "-v, --version") {
    this.versionNumber = version;
    this.option(customFlags, "Display version number");
    return this;
  }
  example(example) {
    this.examples.push(example);
    return this;
  }
  option(rawName, description, config) {
    const option = new Option(rawName, description, config);
    this.options.push(option);
    return this;
  }
  alias(name) {
    this.aliasNames.push(name);
    return this;
  }
  action(callback) {
    this.commandAction = callback;
    return this;
  }
  isMatched(name) {
    return this.name === name || this.aliasNames.includes(name);
  }
  get isDefaultCommand() {
    return this.name === "" || this.aliasNames.includes("!");
  }
  get isGlobalCommand() {
    return this instanceof GlobalCommand;
  }
  hasOption(name) {
    name = name.split(".")[0];
    return this.options.find((option) => {
      return option.names.includes(name);
    });
  }
  outputHelp() {
    const { name, commands } = this.cli;
    const {
      versionNumber,
      options: globalOptions,
      helpCallback
    } = this.cli.globalCommand;
    let sections = [
      {
        body: `${name}${versionNumber ? `/${versionNumber}` : ""}`
      }
    ];
    sections.push({
      title: "Usage",
      body: `  $ ${name} ${this.usageText || this.rawName}`
    });
    const showCommands = (this.isGlobalCommand || this.isDefaultCommand) && commands.length > 0;
    if (showCommands) {
      const longestCommandName = findLongest(commands.map((command) => command.rawName));
      sections.push({
        title: "Commands",
        body: commands.map((command) => {
          return `  ${padRight(command.rawName, longestCommandName.length)}  ${command.description}`;
        }).join("\n")
      });
      sections.push({
        title: `For more info, run any command with the \`--help\` flag`,
        body: commands.map((command) => `  $ ${name}${command.name === "" ? "" : ` ${command.name}`} --help`).join("\n")
      });
    }
    let options = this.isGlobalCommand ? globalOptions : [...this.options, ...globalOptions || []];
    if (!this.isGlobalCommand && !this.isDefaultCommand) {
      options = options.filter((option) => option.name !== "version");
    }
    if (options.length > 0) {
      const longestOptionName = findLongest(options.map((option) => option.rawName));
      sections.push({
        title: "Options",
        body: options.map((option) => {
          return `  ${padRight(option.rawName, longestOptionName.length)}  ${option.description} ${option.config.default === void 0 ? "" : `(default: ${option.config.default})`}`;
        }).join("\n")
      });
    }
    if (this.examples.length > 0) {
      sections.push({
        title: "Examples",
        body: this.examples.map((example) => {
          if (typeof example === "function") {
            return example(name);
          }
          return example;
        }).join("\n")
      });
    }
    if (helpCallback) {
      sections = helpCallback(sections) || sections;
    }
    console.log(sections.map((section) => {
      return section.title ? `${section.title}:
${section.body}` : section.body;
    }).join("\n\n"));
  }
  outputVersion() {
    const { name } = this.cli;
    const { versionNumber } = this.cli.globalCommand;
    if (versionNumber) {
      console.log(`${name}/${versionNumber} ${platformInfo}`);
    }
  }
  checkRequiredArgs() {
    const minimalArgsCount = this.args.filter((arg) => arg.required).length;
    if (this.cli.args.length < minimalArgsCount) {
      throw new CACError(`missing required args for command \`${this.rawName}\``);
    }
  }
  checkUnknownOptions() {
    const { options, globalCommand } = this.cli;
    if (!this.config.allowUnknownOptions) {
      for (const name of Object.keys(options)) {
        if (name !== "--" && !this.hasOption(name) && !globalCommand.hasOption(name)) {
          throw new CACError(`Unknown option \`${name.length > 1 ? `--${name}` : `-${name}`}\``);
        }
      }
    }
  }
  checkOptionValue() {
    const { options: parsedOptions, globalCommand } = this.cli;
    const options = [...globalCommand.options, ...this.options];
    for (const option of options) {
      const value = parsedOptions[option.name.split(".")[0]];
      if (option.required) {
        const hasNegated = options.some((o) => o.negated && o.names.includes(option.name));
        if (value === true || value === false && !hasNegated) {
          throw new CACError(`option \`${option.rawName}\` value is missing`);
        }
      }
    }
  }
};
var GlobalCommand = class extends Command {
  constructor(cli) {
    super("@@global@@", "", {}, cli);
  }
};
var __assign = Object.assign;
var CAC = class extends EventEmitter {
  constructor(name = "") {
    super();
    this.name = name;
    this.commands = [];
    this.rawArgs = [];
    this.args = [];
    this.options = {};
    this.globalCommand = new GlobalCommand(this);
    this.globalCommand.usage("<command> [options]");
  }
  usage(text) {
    this.globalCommand.usage(text);
    return this;
  }
  command(rawName, description, config) {
    const command = new Command(rawName, description || "", config, this);
    command.globalCommand = this.globalCommand;
    this.commands.push(command);
    return command;
  }
  option(rawName, description, config) {
    this.globalCommand.option(rawName, description, config);
    return this;
  }
  help(callback) {
    this.globalCommand.option("-h, --help", "Display this message");
    this.globalCommand.helpCallback = callback;
    this.showHelpOnExit = true;
    return this;
  }
  version(version, customFlags = "-v, --version") {
    this.globalCommand.version(version, customFlags);
    this.showVersionOnExit = true;
    return this;
  }
  example(example) {
    this.globalCommand.example(example);
    return this;
  }
  outputHelp() {
    if (this.matchedCommand) {
      this.matchedCommand.outputHelp();
    } else {
      this.globalCommand.outputHelp();
    }
  }
  outputVersion() {
    this.globalCommand.outputVersion();
  }
  setParsedInfo({ args, options }, matchedCommand, matchedCommandName) {
    this.args = args;
    this.options = options;
    if (matchedCommand) {
      this.matchedCommand = matchedCommand;
    }
    if (matchedCommandName) {
      this.matchedCommandName = matchedCommandName;
    }
    return this;
  }
  unsetMatchedCommand() {
    this.matchedCommand = void 0;
    this.matchedCommandName = void 0;
  }
  parse(argv = processArgs, {
    run = true
  } = {}) {
    this.rawArgs = argv;
    if (!this.name) {
      this.name = argv[1] ? getFileName(argv[1]) : "cli";
    }
    let shouldParse = true;
    for (const command of this.commands) {
      const parsed = this.mri(argv.slice(2), command);
      const commandName = parsed.args[0];
      if (command.isMatched(commandName)) {
        shouldParse = false;
        const parsedInfo = __assign(__assign({}, parsed), {
          args: parsed.args.slice(1)
        });
        this.setParsedInfo(parsedInfo, command, commandName);
        this.emit(`command:${commandName}`, command);
      }
    }
    if (shouldParse) {
      for (const command of this.commands) {
        if (command.name === "") {
          shouldParse = false;
          const parsed = this.mri(argv.slice(2), command);
          this.setParsedInfo(parsed, command);
          this.emit(`command:!`, command);
        }
      }
    }
    if (shouldParse) {
      const parsed = this.mri(argv.slice(2));
      this.setParsedInfo(parsed);
    }
    if (this.options.help && this.showHelpOnExit) {
      this.outputHelp();
      run = false;
      this.unsetMatchedCommand();
    }
    if (this.options.version && this.showVersionOnExit && this.matchedCommandName == null) {
      this.outputVersion();
      run = false;
      this.unsetMatchedCommand();
    }
    const parsedArgv = { args: this.args, options: this.options };
    if (run) {
      this.runMatchedCommand();
    }
    if (!this.matchedCommand && this.args[0]) {
      this.emit("command:*");
    }
    return parsedArgv;
  }
  mri(argv, command) {
    const cliOptions = [
      ...this.globalCommand.options,
      ...command ? command.options : []
    ];
    const mriOptions = getMriOptions(cliOptions);
    let argsAfterDoubleDashes = [];
    const doubleDashesIndex = argv.indexOf("--");
    if (doubleDashesIndex > -1) {
      argsAfterDoubleDashes = argv.slice(doubleDashesIndex + 1);
      argv = argv.slice(0, doubleDashesIndex);
    }
    let parsed = mri2(argv, mriOptions);
    parsed = Object.keys(parsed).reduce((res, name) => {
      return __assign(__assign({}, res), {
        [camelcaseOptionName(name)]: parsed[name]
      });
    }, { _: [] });
    const args = parsed._;
    const options = {
      "--": argsAfterDoubleDashes
    };
    const ignoreDefault = command && command.config.ignoreOptionDefaultValue ? command.config.ignoreOptionDefaultValue : this.globalCommand.config.ignoreOptionDefaultValue;
    let transforms = /* @__PURE__ */ Object.create(null);
    for (const cliOption of cliOptions) {
      if (!ignoreDefault && cliOption.config.default !== void 0) {
        for (const name of cliOption.names) {
          options[name] = cliOption.config.default;
        }
      }
      if (Array.isArray(cliOption.config.type)) {
        if (transforms[cliOption.name] === void 0) {
          transforms[cliOption.name] = /* @__PURE__ */ Object.create(null);
          transforms[cliOption.name]["shouldTransform"] = true;
          transforms[cliOption.name]["transformFunction"] = cliOption.config.type[0];
        }
      }
    }
    for (const key of Object.keys(parsed)) {
      if (key !== "_") {
        const keys = key.split(".");
        setDotProp(options, keys, parsed[key]);
        setByType(options, transforms);
      }
    }
    return {
      args,
      options
    };
  }
  runMatchedCommand() {
    const { args, options, matchedCommand: command } = this;
    if (!command || !command.commandAction)
      return;
    command.checkUnknownOptions();
    command.checkOptionValue();
    command.checkRequiredArgs();
    const actionArgs = [];
    command.args.forEach((arg, index) => {
      if (arg.variadic) {
        actionArgs.push(args.slice(index));
      } else {
        actionArgs.push(args[index]);
      }
    });
    actionArgs.push(options);
    return command.commandAction.apply(this, actionArgs);
  }
};
var cac = (name = "") => new CAC(name);
var dist_default = cac;
var useDts = async (config) => {
  const tsconfig = await loadTsConfig(config.tsconfig);
  let builtFirst = () => {
  };
  const worker = new Worker(new URL("./dtsWorker.js", import.meta.url), {
    workerData: {
      options: tsconfig.options,
      config
    }
  });
  const rebuild = async (once) => {
    worker.postMessage({
      message: "rebuild",
      once
    });
  };
  const end = async () => {
    worker.postMessage({
      message: "end"
    });
    worker.terminate();
  };
  worker.on("message", (message) => {
    if (message === "builtFirst") {
      builtFirst();
    }
  });
  return {
    rebuild,
    end,
    setBuiltFirst: (fn) => {
      builtFirst = fn;
    }
  };
};
var getDts = async (config) => {
  let dts;
  if (config.dts) {
    dts = await useDts(config);
  }
  return {
    rebuild: async (once) => {
      if (dts) {
        await dts.rebuild(once);
      }
    },
    end: async () => {
      const promise = Promise.withResolvers();
      if (dts) {
        if (config.watch) {
          await dts.end().then(() => promise.resolve(void 0));
        } else {
          dts.setBuiltFirst(async () => {
            await dts.end();
            promise.resolve(void 0);
          });
        }
      }
      return promise.promise;
    }
  };
};

// src/esbuild.ts
var esbuild = await $import("esbuild");
var svelte = void 0;
var parseEsbuildResult = (result) => {
  const outputs = {};
  for (const [file, meta] of Object.entries(result.metafile?.outputs ?? {})) {
    outputs[file] = meta.bytes;
  }
  return {
    outputs,
    warnings: result.warnings.map((w) => ({
      message: w.text,
      detail: w.detail
    })),
    errors: result.errors.map((w) => ({
      message: w.text,
      detail: w.detail
    }))
  };
};
var analyzeResult = (result, config) => {
  if (result.errors.length) {
    logger_default.error("There were errors during the build process");
    for (const error of result.errors) {
      logger_default.error(
        `${error.message}${config.detailedBuildErrors ? `
${error.detail}` : ""}`
      );
    }
    process.exit(1);
  }
  if (result.warnings.length) {
    logger_default.warn("There were warnings during the build process");
    for (const warning of result.warnings) {
      logger_default.warn(
        `${warning.message}${config.detailedBuildErrors ? `
${warning.detail}` : ""}`
      );
    }
  }
  const outputs = {};
  for (const [file, size] of Object.entries(result.outputs)) {
    outputs[path.relative(config.outdir, file)] = size;
  }
  console.log(formatAnalysis(Object.entries(outputs)));
};
var buildSvelte = async (content, sp, opts) => {
  let sveltePreprocess;
  const warnings = [];
  if (sp) {
    sveltePreprocess = await $import(
      "svelte-preprocess"
    );
  }
  const processed = await svelte.preprocess(content, [
    {
      script: async (_opts) => {
        const { json, toStr } = modifyRawJson(
          opts.tsconfigRaw
        );
        json.compilerOptions.importsNotUsedAsValues = "preserve";
        json.compilerOptions.preserveValueImports = true;
        const transformed = await esbuild.transform(_opts.content, {
          format: opts.format,
          treeShaking: false,
          tsconfigRaw: toStr(),
          target: opts.target,
          minify: false,
          platform: opts.platform,
          sourcemap: opts.sourcemap,
          loader: "ts"
        });
        const _warnings = transformed.warnings.map((w) => ({
          message: w.text,
          detail: w.detail
        }));
        warnings.push(..._warnings);
        return {
          code: transformed.code,
          map: transformed.map
        };
      }
    },
    sp ? (
      // @ts-ignore
      sveltePreprocess.sveltePreprocess({
        typescript: false
      })
    ) : {}
  ]);
  return {
    code: processed.code,
    map: processed.map,
    warnings
  };
};
var hashs = {};
var buildSvelteFiles = async (files, config, opts, first) => {
  const outputs = {};
  const warnings = [];
  if (first) {
    for (const file of files) {
      const content = await fs.readFile(file, "utf-8");
      const hash = getHash(content);
      hashs[file] = hash;
      const code = await buildSvelte(
        content,
        config.useSveltePreprocess,
        opts
      );
      const outfile = getPathInOutdir(
        file,
        config.outdir,
        config.outBase
      );
      await fs.mkdir(path.dirname(outfile), { recursive: true });
      await fs.writeFile(outfile, code.code);
      if (config.sourcemap) {
        const smPath = `${outfile}.map`;
        let map = typeof code.map === "string" ? JSON.parse(code.map) : code.map;
        map = {
          version: 3,
          names: [],
          mappings: "",
          file: path.basename(outfile),
          ...map,
          sources: [path.relative(path.dirname(outfile), file)]
        };
        await fs.writeFile(smPath, JSON.stringify(map));
        outputs[smPath] = (await fs.stat(smPath)).size;
      }
      outputs[outfile] = (await fs.stat(outfile)).size;
      warnings.push(...code.warnings);
    }
  } else {
    for (const file of files) {
      const content = await fs.readFile(file, "utf-8");
      const hash = getHash(content);
      if (hashs[file] !== hash) {
        hashs[file] = hash;
        const code = await buildSvelte(
          content,
          config.useSveltePreprocess,
          opts
        );
        const outfile = getPathInOutdir(
          file,
          config.outdir,
          config.outBase
        );
        await fs.mkdir(path.dirname(outfile), { recursive: true });
        if (config.clean) {
          await fs.rm(outfile, { force: true });
        }
        await fs.writeFile(outfile, code.code);
        outputs[outfile] = (await fs.stat(outfile)).size;
        warnings.push(...code.warnings);
      }
    }
  }
  return {
    outputs,
    warnings,
    errors: []
  };
};
var useEsbuild = async (opts, config, events = {}) => {
  if (config.svelte && config.entry.some((f) => f.endsWith(".svelte"))) {
    svelte = await $import(
      "svelte/compiler"
    );
  }
  if (!config.svelte && config.entry.some((f) => f.endsWith(".svelte"))) {
    logger_default.error(
      "Please set svelte to true in the config to build .svelte files"
    );
    process.exit(1);
  }
  const ctx = await esbuild.context(opts);
  const dts = await getDts(config);
  let once = false;
  const rebuild = async () => {
    if (once) {
      logger_default.info("Rebuilding...");
    } else {
      if (config.clean) {
        logger_default.info("Cleaning output directory...");
        await fs.rm(config.outdir, { recursive: true, force: true });
      }
      logger_default.info("Building...");
    }
    await dts.rebuild(once);
    try {
      const start = performance.now();
      const esbuildResult = await ctx.rebuild();
      const svResult = await buildSvelteFiles(
        config.entry.filter((f) => f.endsWith(".svelte")),
        config,
        opts,
        !once
      );
      const end = performance.now();
      events.afterBuild?.();
      const _res = parseEsbuildResult(esbuildResult);
      analyzeResult(
        {
          errors: [..._res.errors, ...svResult.errors],
          outputs: { ..._res.outputs, ...svResult.outputs },
          warnings: [..._res.warnings, ...svResult.warnings]
        },
        config
      );
      logger_default.success(`Build completed in ${(end - start).toFixed(2)}ms`);
    } catch (e) {
      logger_default.error(
        `Build failed due to errors
 - ${e.message}`
      );
      events.onError?.(e);
    }
    if (!once) {
      once = true;
    }
  };
  let watcher;
  return {
    rebuild,
    async watch() {
      const chokidar = await $import(
        "chokidar"
      );
      watcher = chokidar.watch(config.entry, {
        ignoreInitial: true,
        persistent: true,
        ignorePermissionErrors: true,
        ignored: [...config.ignore, "**/{node_modules,.git}/**"]
      });
      watcher.on("all", async () => {
        await rebuild();
      });
      onSigInt(async () => {
        await this.end();
      });
    },
    async end() {
      await ctx.dispose();
      if (watcher?.closed === false) {
        watcher.close();
      }
      events.onEnd?.();
      logger_default.info("Build process ended");
      dts.end().then(() => {
        process.exit(0);
      });
    }
  };
};

// src/build.ts
var ts = await $import("typescript");
var loadTsConfig = async (tsconfig) => {
  const tsconfigPath = path.isAbsolute(tsconfig) ? tsconfig : path.resolve(tsconfig);
  try {
    const content = await fs.readFile(tsconfigPath, "utf-8");
    const result = ts.parseJsonConfigFileContent(
      JSON.parse(content),
      ts.sys,
      path.dirname(tsconfigPath),
      void 0,
      tsconfigPath,
      void 0,
      [
        {
          extension: "svelte",
          isMixedContent: true,
          scriptKind: ts.ScriptKind.Deferred
        }
      ]
    );
    if (result.errors.length) {
      throw new Error("errors");
    }
    return {
      raw: content,
      options: result.options
    };
  } catch (e) {
    const error = e;
    if (error.message === "errors") {
      logger_default.error("Couldn't parse tsconfig file");
    } else {
      logger_default.warn("Couldn't find tsconfig file, using default options");
    }
    return {
      raw: "{}",
      options: {}
    };
  }
};
var build = async (config) => {
  const entries = (await globby(config.entry)).map((f) => path.resolve(f));
  const outbase = path.resolve(
    config.outBase ?? getLeastCommonAncestor(entries)
  );
  config.outBase = outbase;
  const tsc = await loadTsConfig(config.tsconfig);
  const outdirExists = await fs.stat(config.outdir).catch(() => null);
  if (!outdirExists || !outdirExists.isDirectory()) {
    await fs.mkdir(config.outdir, { recursive: true });
  }
  const opts = {
    entryPoints: entries.filter((f) => !f.endsWith(".svelte")),
    outdir: config.outdir,
    format: config.format,
    bundle: config.bundle,
    minify: config.minify,
    sourcemap: config.sourcemap ? "external" : false,
    platform: config.platform,
    treeShaking: true,
    tsconfigRaw: tsc.raw,
    target: config.target,
    splitting: config.format === "esm" && config.splitting,
    plugins: config.plugins,
    mainFields: config.platform === "node" ? ["module", "main"] : ["browser", "module", "main"],
    metafile: true
  };
  const foo = await useEsbuild(opts, {
    ...config,
    entry: entries
  });
  await foo.rebuild();
  !config.watch && await foo.end();
  config.watch && await foo.watch();
};

// src/cli.ts
var program = dist_default("libx");
program.version("0.0.1");
program.command("build [...entry]", "Build the library").option("-o, --outdir <output>", "Output directory").option("-f, --format <format>", "Module format").option("-w, --watch", "Watch mode").option("--tsconfig <tsconfig>", "Path to tsconfig file").option("-b, --bundle", "Bundle the files").option("--minify", "Minify the files").option("-s, --sourcemap", "Generate sourcemaps").option("-p, --platform <platform>", "Platform to build for").option("--splitting", "Enable code splitting").option("--target <...target>", "Target environment").option("--svelte-preprocess", "Use svelte preprocess").option("--out-base <outBase>", "Base path for the output files").option("-c, --clean", "Clean the output directory before building").option("--detailed-build-errors", "Show detailed build errors").option("-i, --ignore <...ignore>", "Files to ignore").option("-dts", "Generate dts files").option("--svelte", "Whether to build .svelte files").action(async (entry, opts) => {
  const cliConfig = removeEmptyValues({
    entry,
    outdir: opts.outdir,
    format: opts.format,
    watch: opts.watch,
    bundle: opts.bundle,
    minify: opts.minify,
    sourcemap: opts.sourcemap,
    tsconfig: opts.tsconfig,
    platform: opts.platform,
    splitting: opts.splitting,
    target: opts.target,
    sveltePreprocess: opts.sveltePreprocess,
    outBase: opts.outBase,
    clean: opts.clean,
    detailedBuildErrors: opts.detailedBuildErrors,
    ignore: opts.ignore,
    dts: opts.dts,
    svelte: opts.svelte
  });
  let fileConfig = await loadConfig();
  if (typeof fileConfig === "function") {
    fileConfig = fileConfig(cliConfig);
  }
  const finalConfig = {
    ...{
      format: "esm",
      watch: false,
      bundle: false,
      minify: false,
      sourcemap: false,
      entry: [],
      outdir: "dist",
      tsconfig: "tsconfig.json",
      platform: "browser",
      splitting: false,
      target: ["esnext"],
      plugins: [],
      useSveltePreprocess: false,
      outBase: void 0,
      clean: false,
      detailedBuildErrors: false,
      ignore: [],
      dts: false,
      svelte: false
    },
    ...fileConfig,
    ...cliConfig
  };
  if (cliConfig.entry?.length === 0 && fileConfig?.entry?.length && fileConfig.entry.length > 0) {
    finalConfig.entry = fileConfig.entry;
  }
  if (cliConfig.target?.length === 0 && fileConfig?.target?.length && fileConfig.target.length > 0) {
    finalConfig.target = fileConfig.target;
  }
  if (cliConfig.ignore?.length === 0 && fileConfig?.ignore?.length && fileConfig.ignore.length > 0) {
    finalConfig.ignore = fileConfig.ignore;
  }
  await build(finalConfig);
});
program.help();
program.parse();
