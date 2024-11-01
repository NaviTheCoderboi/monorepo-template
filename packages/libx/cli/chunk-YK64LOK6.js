import { createHash } from 'node:crypto';
import path from 'node:path';
import { createInterface } from 'node:readline';

// src/colors.ts
var c = (color) => {
  return `\x1B[38;2;${color.r};${color.g};${color.b}m`;
};
var $reset = "\x1B[0m";
var $colored = (color, ...text) => {
  return `${c(color)}${text.join(" ")}${$reset}`.trim();
};

// src/logger.ts
var error = (...msgs) => {
  console.error(
    $colored(
      {
        r: 244,
        g: 63,
        b: 94
      },
      "\u2718",
      ...msgs
    )
  );
};
var success = (...msgs) => {
  console.log(
    $colored(
      {
        r: 74,
        g: 222,
        b: 128
      },
      "\u2714",
      ...msgs
    )
  );
};
var info = (...msgs) => {
  console.log(
    $colored(
      {
        r: 56,
        g: 189,
        b: 248
      },
      "\u2139",
      ...msgs
    )
  );
};
var warn = (...msgs) => {
  console.warn(
    $colored(
      {
        r: 249,
        g: 115,
        b: 22
      },
      "\u26A0",
      ...msgs
    )
  );
};
var logger = {
  error,
  success,
  info,
  warn
};
var logger_default = logger;
var removeEmptyValues = (obj) => {
  return Object.fromEntries(
    Object.entries(obj).filter(
      ([_, value]) => value !== void 0 && value !== null
    )
  );
};
var $import = async (name, _default = false) => {
  try {
    const module = await import(name);
    return _default ? module.default : module;
  } catch {
    logger_default.error(
      `Please install ${name}
 - npm install ${name} 
 - yarn add ${name} 
 - pnpm add ${name}`
    );
    process.emit("SIGINT");
  }
};
var getHash = (str) => {
  return createHash("sha256").update(str).digest("hex");
};
var getPathInOutdir = (file, outdir, basedir) => {
  const relative = path.relative(basedir, file);
  return path.resolve(outdir, relative);
};
var getLeastCommonAncestor = (paths) => {
  const sep = path.sep;
  const [first, ...rest] = paths;
  const parts = first.split(sep);
  return parts.map((_, i) => parts.slice(0, i + 1).join(sep)).filter((part) => rest.every((p) => p.startsWith(part))).pop();
};
var onSigInt = (cb) => {
  if (process.platform === "win32") {
    const rl = createInterface({
      input: process.stdin,
      output: process.stdout
    });
    rl.on("SIGINT", () => {
      process.emit("SIGINT");
    });
  }
  process.on("SIGINT", cb);
};
var bytesToReadable = (bytes) => {
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  if (bytes === 0) return "0B";
  const i = Math.floor(Math.log2(bytes) / 10);
  return `${(bytes / 1024 ** i).toFixed(2)}${sizes[i]}`;
};
var formatAnalysis = (analysis) => {
  const maxKeyLength = Math.max(...analysis.map(([key]) => key.length));
  const formatted = analysis.map(([file, bytes]) => {
    const padding = " ".repeat(maxKeyLength - file.length);
    const fileName = $colored(
      {
        r: 255,
        g: 255,
        b: 255
      },
      `${file}${padding}`
    );
    const fileSize = $colored(
      {
        r: 190,
        g: 242,
        b: 100
      },
      bytesToReadable(bytes)
    );
    return `${fileName}  ${fileSize}`;
  });
  return formatted.join("\n");
};
var modifyRawJson = (json) => {
  try {
    const _json = JSON.parse(json);
    return {
      json: _json,
      toStr: () => JSON.stringify(_json, null, 4)
    };
  } catch {
    return {
      json: {},
      toStr: () => json
    };
  }
};

export { $import, formatAnalysis, getHash, getLeastCommonAncestor, getPathInOutdir, logger_default, modifyRawJson, onSigInt, removeEmptyValues };
