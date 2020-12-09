const { JsiiProject } = require('projen');

const project = new JsiiProject({
  authorAddress: 'benisrae@amazon.com',
  authorName: 'Elad Ben-Israel',
  name: 'cfunctions',
  repository: 'https://github.com/eladb/cfunctions.git',
  releaseBranches: ['main'],
  python: {
    module: 'cfunctions',
    distName: 'cfunctions',
  },
});

project.addBundledDeps('esbuild', 'fs-extra@8');
project.addDevDeps('@types/fs-extra@8');

project.synth();
