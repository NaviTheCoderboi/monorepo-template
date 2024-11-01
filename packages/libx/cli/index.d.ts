import { Plugin } from 'esbuild';

type BrowserTarget = 'chrome' | 'deno' | 'edge' | 'firefox' | 'hermes' | 'ie' | 'ios' | 'node' | 'opera' | 'rhino' | 'safari';
type BrowserTargetWithVersion = `${BrowserTarget}${number}` | `${BrowserTarget}${number}.${number}` | `${BrowserTarget}${number}.${number}.${number}`;
type EsTarget = 'es3' | 'es5' | 'es6' | 'es2015' | 'es2016' | 'es2017' | 'es2018' | 'es2019' | 'es2020' | 'es2021' | 'es2022' | 'es2023' | 'esnext';
type Target = BrowserTarget | BrowserTargetWithVersion | EsTarget;
interface Config {
    /**
     * Entry files/glob patterns that should be used to build the library
     */
    entry: string[];
    /**
     * Output directory where the build files should be placed
     */
    outdir: string;
    /**
     * Module format to use
     */
    format: 'esm' | 'cjs' | 'iife';
    /**
     * Whether to watch the files for changes
     */
    watch: boolean;
    /**
     * Path to tsconfig file
     */
    tsconfig: string;
    /**
     * Bundle the files
     */
    bundle: boolean;
    /**
     * Minify the files
     */
    minify: boolean;
    /**
     * Generate sourcemaps
     */
    sourcemap: boolean;
    /**
     * Platform to build for
     */
    platform: 'node' | 'browser' | 'neutral';
    /**
     * Enable code splitting
     */
    splitting: boolean;
    /**
     * Target environment
     */
    target: Target[];
    /**
     * Plugins for esbuild
     */
    plugins: Plugin[];
    /**
     * Use svelte-preprocess for preprocessing .svelte files (uses esbuild by default)
     */
    useSveltePreprocess: boolean;
    /**
     * Base path for the output files(defaults to lowest common ancestor)
     */
    outBase: string;
    /**
     * Clean the output directory before building
     */
    clean: boolean;
    /**
     * Whether to log detailed build errors
     */
    detailedBuildErrors: boolean;
    /**
     * Ignore the files for watching
     */
    ignore: string[];
    /**
     * Generate declaration files
     */
    dts: boolean;
    /**
     * Whether to build .svelte files
     */
    svelte: boolean;
}
type ConfigFile = ((opts: Record<string, any>) => Partial<Config>) | Partial<Config>;
/**
 * Define the configuration for the libx
 *
 * **TIP** You can also pass a function that returns the configuration object to defineConfig , you get options object as an argument to the function
 *
 * @param {ConfigFile} config - The configuration object/function
 * @returns  {ConfigFile} The configuration object/function
 */
declare const defineConfig: (config: ConfigFile) => ConfigFile;

export { defineConfig };
