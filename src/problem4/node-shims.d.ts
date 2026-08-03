interface NodeRequire {
  (name: string): any;
  main: any;
}

declare const require: NodeRequire;
declare const module: any;
declare const __dirname: string;

declare const process: {
  argv: string[];
  cwd(): string;
  execPath: string;
  exitCode?: number;
};
