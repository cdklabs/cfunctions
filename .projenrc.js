const { JsiiProject } = require('projen');

const project = new JsiiProject({
  authorAddress: 'benisrae@amazon.com',
  authorName: 'Elad Ben-Israel',
  name: 'cfunctions',
  repository: 'https://github.com/eladb/cfunctions.git',
  defaultReleaseBranch: 'main',
  projenUpgradeSecret: 'PROJEN_GITHUB_TOKEN',
  python: {
    module: 'cfunctions',
    distName: 'cfunctions',
  },
});

project.addBundledDeps('fs-extra@8');
project.addDevDeps('@types/fs-extra@8', 'esbuild');

// since it's a native module we have to rely on consumer to install it on their system
// project.addPeerDeps('esbuild@^0.8.21');

project.synth();
