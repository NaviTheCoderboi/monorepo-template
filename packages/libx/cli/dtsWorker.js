import { $import, logger_default, getHash } from './chunk-YK64LOK6.js';
import fsS from 'node:fs';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { parentPort, workerData } from 'node:worker_threads';

var ts = await $import("typescript");
var svelte = void 0;
var s2x = void 0;
var data = workerData;
if (data.config.svelte && data.config.entry.some((file) => file.endsWith(".svelte"))) {
  svelte = await $import("svelte");
  s2x = await $import("svelte2tsx");
}
var isSvelteFile = (file) => file.endsWith(".svelte");
var isTsScript = (content) => /<script\s+[^>]*?lang=('|")(ts|typescript)('|")/.test(content);
var compileSvelte = (pth, content) => s2x.svelte2tsx(content, {
  emitOnTemplateError: true,
  filename: pth,
  isTsFile: isTsScript(content),
  mode: "dts",
  version: svelte.VERSION,
  // @ts-ignore
  noSvelteComponentTyped: true
}).code;
var getCorrectedPath = (pth) => {
  if (process.platform === "win32") {
    return pth.replace(/\//g, "\\");
  }
  return pth;
};
var files = /* @__PURE__ */ new Map();
for (const file of data.config.entry) {
  const content = await fs.readFile(file, "utf-8");
  if (isSvelteFile(file)) {
    const tsx = compileSvelte(file, content);
    files.set(file, {
      version: 0,
      content: tsx
    });
  } else {
    files.set(file, {
      version: 0,
      content
    });
  }
}
var opts = {
  ...data.options,
  declaration: true,
  emitDeclarationOnly: true,
  declarationDir: data.config.outdir,
  outDir: data.config.outdir,
  declarationMap: data.config.sourcemap,
  allowNonTsExtensions: true,
  moduleResolution: ts.ModuleResolutionKind.Node10
};
var servicesHost = {
  getScriptFileNames: () => data.config.svelte ? [
    fileURLToPath(
      import.meta.resolve("svelte2tsx/svelte-shims-v4.d.ts")
    ),
    ...data.config.entry
  ] : data.config.entry,
  getScriptVersion: (fileName) => {
    const pth = getCorrectedPath(fileName);
    return files.get(pth)?.version.toString() ?? "0";
  },
  getScriptSnapshot: (fileName) => {
    const pth = getCorrectedPath(fileName);
    if (isSvelteFile(pth)) {
      return ts.ScriptSnapshot.fromString(
        files.get(pth)?.content ?? fsS.readFileSync(pth, "utf-8")
      );
    }
    if (!fsS.existsSync(pth)) {
      return void 0;
    }
    return ts.ScriptSnapshot.fromString(fsS.readFileSync(pth, "utf-8"));
  },
  getCurrentDirectory: () => process.cwd(),
  getCompilationSettings: () => opts,
  getDefaultLibFileName: (options) => ts.getDefaultLibFilePath(options),
  fileExists: ts.sys.fileExists,
  readFile: (pth, encoding) => {
    const corrected = getCorrectedPath(pth);
    if (isSvelteFile(corrected)) {
      return files.get(corrected)?.content ?? ts.sys.readFile(corrected, encoding ?? "utf-8");
    }
    return ts.sys.readFile(corrected, encoding ?? "utf-8");
  },
  readDirectory: ts.sys.readDirectory,
  directoryExists: ts.sys.directoryExists,
  getDirectories: ts.sys.getDirectories
};
var resolveModuleName = (name, containingFile, compilerOptions) => {
  const tsResolvedModule = ts.resolveModuleName(
    name,
    containingFile,
    compilerOptions,
    ts.sys
  ).resolvedModule;
  if (tsResolvedModule && !isSvelteFile(tsResolvedModule.resolvedFileName)) {
    return tsResolvedModule;
  }
  return ts.resolveModuleName(
    name,
    containingFile,
    compilerOptions,
    servicesHost
  ).resolvedModule;
};
servicesHost.resolveModuleNameLiterals = (moduleLiterals, containingFile, _redirectedReference, compilerOptions) => {
  return moduleLiterals.map((moduleLiteral) => {
    return {
      resolvedModule: resolveModuleName(
        moduleLiteral.text,
        containingFile,
        compilerOptions
      )
    };
  });
};
servicesHost.resolveModuleNames = (moduleNames, containingFile, _reusedNames, _redirectedReference, compilerOptions) => {
  return moduleNames.map((moduleName) => {
    return resolveModuleName(moduleName, containingFile, compilerOptions);
  });
};
var services = ts.createLanguageService(
  servicesHost,
  ts.createDocumentRegistry()
);
var logErrors = (fileName) => {
  const allDiagnostics = services.getCompilerOptionsDiagnostics().concat(services.getSyntacticDiagnostics(fileName)).concat(services.getSemanticDiagnostics(fileName));
  for (const diagnostic of allDiagnostics) {
    const message = ts.flattenDiagnosticMessageText(
      diagnostic.messageText,
      "\n"
    );
    if (diagnostic.file) {
      const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(
        diagnostic.start
      );
      logger_default.error(
        `Error ${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`
      );
    } else {
      logger_default.error(`Error: ${message}`);
    }
  }
};
var emit = async (fileName) => {
  const output = services.getEmitOutput(fileName);
  if (!output.emitSkipped) {
    for (const f of output.outputFiles) {
      await fs.writeFile(f.name, f.text, "utf-8");
    }
  } else {
    logErrors(fileName);
  }
};
var rebuild = async (once) => {
  let gen = false;
  if (!once) {
    for (const file of files) {
      await emit(file[0]);
      gen = true;
    }
  } else {
    for (const file of files) {
      const newContent = await fs.readFile(file[0], "utf-8");
      const oldHash = getHash(file[1].content);
      const newHash = getHash(newContent);
      if (oldHash !== newHash) {
        files.set(file[0], {
          content: isSvelteFile(file[0]) ? compileSvelte(file[0], newContent) : newContent,
          version: file[1].version + 1
        });
        await emit(file[0]);
        gen = true;
      }
    }
  }
  return gen;
};
parentPort?.on("message", async (message) => {
  let builtFirst = false;
  if (message.message === "end") {
    parentPort?.close();
    return;
  }
  if (message.message === "rebuild") {
    const start = performance.now();
    const generated = await rebuild(message.once);
    const end = performance.now();
    if (generated) {
      logger_default.info(
        `Generated declaration files in ${(end - start).toFixed(2)}ms`
      );
    }
    if (!builtFirst) {
      builtFirst = true;
      parentPort?.postMessage("builtFirst");
    }
  }
});
