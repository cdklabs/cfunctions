import * as child_process from 'child_process';
import { createHash } from 'crypto';
import { tmpdir } from 'os';
import { join, resolve, dirname, relative } from 'path';
import { chdir } from 'process';

try {
  /* eslint-disable import/no-extraneous-dependencies */
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require.resolve('esbuild/package.json');
  /* eslint-enable import/no-extraneous-dependencies */
} catch (e) {
  throw new Error('"esbuild" must be installed on the system');
}


// we are taking a "runtime peer" dependency on esbuild
// eslint-disable-next-line import/no-extraneous-dependencies
import * as esbuild from 'esbuild';

import { mkdtempSync, writeFileSync, readFileSync, copySync } from 'fs-extra';

export interface CFunctionProps {
  /**
   * Symbols to capture
   */
  readonly capture?: { [name: string]: any };

  /**
   * Javascript code to execute
   * @default "true;"
   */
  readonly code?: string;
}

export interface ExecOptions {
  /**
   * Environment variables to bind to the child process.
   *
   * You can use `cfunction.env` to bind the original symbols.
   *
   * @default {}
   */
  readonly env?: { [name: string]: string };
}

export class CFunction {
  public static exec(file: string, options: ExecOptions = {}): any {
    try {
      const substrate = `require('${file}')().catch(e => { console.error(e.stack); process.exit(1); }).then(o => console.log(JSON.stringify(o)))`;
      const child = child_process.spawnSync(process.execPath, ['-e', substrate], {
        stdio: ['inherit', 'pipe', 'pipe'],
        env: options.env ?? {},
      });

      const stderr = child.stderr.toString('utf-8');

      if (child.status !== 0) {
        throw new Error(`non-exit from child process: ${stderr}`);
      }

      // allow function to emit logs to STDERR (non-streaming)
      if (stderr.length) {
        console.error(stderr);
      }

      // STDOUT is the result
      return JSON.parse(child.stdout.toString());
    } catch (e) {
      throw new Error(`unable to execute ${file}: ${e.message}`);
    }
  }

  /**
   * The location of the function bundle (.js file).
   */
  public readonly outfile: string;

  /**
   * Environment variables that are expected to be available when the function
   * is executed.
   */
  public readonly env: { [name: string]: string };

  private readonly workdir: string;

  constructor(props: CFunctionProps) {
    const outdir = mkdtempSync(join(tmpdir(), '.cf.out.'));
    this.workdir = mkdtempSync(join(tmpdir(), '.cf.work.'));
    this.env = {};

    const workdir = this.workdir;

    // deploy runtime
    const runtimesrc = dirname(require.resolve(join(__dirname, '..', 'resources', 'cfruntime.js')));
    copySync(runtimesrc, workdir);

    const outfile = resolve(outdir, 'cf.js');

    const epcode = new Array<string>();

    this.captureSymbols(props.capture ?? { }, epcode);

    const code = props.code ?? 'true';
    epcode.push(`const output = ${code};`);
    epcode.push('module.exports = require(\'./cfruntime\').wrap(output);');

    const entrypoint = join(workdir, 'entrypoint.js');
    writeFileSync(entrypoint, epcode.join('\n'));

    const restore = process.cwd();
    chdir(workdir);
    try {
      const result = esbuild.buildSync({
        bundle: true,
        entryPoints: [relative(workdir, entrypoint)],
        outfile,
        platform: 'node',
        logLevel: 'silent',
      });
      if (result.warnings?.length) {
        throw new Error('esbuild warnings');
      }
    } catch (e) {
      throw new Error(`esbuild failed at ${workdir} ${e.message}`);
    } finally {
      chdir(restore);
    }

    this.outfile = outfile;
  }


  public toJson(): any {
    return {
      env: this.env,
      js: readFileSync(this.outfile, 'utf-8'),
    };
  }

  private captureSymbols(symbols: { [symbol: string]: any }, code: string[]) {
    for (const [name, value] of Object.entries(symbols)) {

      // if the value is a cfunction, we copy the cf.js file to our workdir and
      // bind the result of "require()"ing it locally.
      if (value instanceof CFunction) {
        const fileName = hashOf(value.outfile) + '.js';
        copySync(value.outfile, join(this.workdir, fileName));
        code.push(`const ${name} = require('./${fileName}');`);
        continue;
      }

      // bind the value through an environment variable (late binding). technically it should be
      // possible to do early-binding for all values that are not CDK tokens but since we are unable
      // to identify tokens at this layer, we have to deffer to late bindings.
      const cvalue = this.captureValue(value);
      const envVar = symbolToEnv(name);
      code.push(`const ${name} = process.env["${envVar}"];`);
      code.push(`if (${name} === undefined) { throw new Error("missing required environment variable '${envVar}'"); }`);

      this.env[envVar] = cvalue;
    }
  }

  private captureValue(x: any) {
    if (typeof(x) === 'function') {
      throw new Error('cannot capture functions yet');
    };
    if (typeof(x) === 'symbol') {
      throw new Error('cannot capture symbols yet');
    }

    if (Array.isArray(x)) {
      return this.captureArray(x);
    }

    if (typeof(x) === 'object') {
      return this.captureObject(x);
    }

    return this.capturePrimitive(x);
  }

  private capturePrimitive(x: string | number | boolean | bigint) {
    return JSON.stringify(x);
  }

  private captureObject(o: any) {
    if (o.constructor.name != 'Object') {
      throw new Error('classes are not supported yet');
    }

    if ('toJson' in o && typeof(o.toJson === 'function')) {
      o = o.toJson();
    }

    const fields = Array<string>();
    for (const [k, v] of Object.entries(o)) {
      fields.push(`"${k}": ${this.captureValue(v)}`);
    }

    return `{ ${fields.join(',' )}}`;
  }

  private captureArray(a: any[]): string {
    return '[' + a.map(x => this.captureValue(x)).join(',') + ']';
  }
}

/** generate an environment variable for a named symbol */
function symbolToEnv(symbol: string) {
  return `__CF__${symbol}__`;
}


function hashOf(file: string): string {
  const sha1 = createHash('sha1');
  sha1.update(readFileSync(file));
  return sha1.digest('hex');
}
