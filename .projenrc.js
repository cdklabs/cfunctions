const { cdk, DependenciesUpgradeMechanism } = require('projen');

const project = new cdk.JsiiProject({
  authorAddress: 'benisrae@amazon.com',
  authorName: 'Elad Ben-Israel',
  name: 'cfunctions',
  repository: 'https://github.com/eladb/cfunctions.git',
  defaultReleaseBranch: 'main',
  projenUpgradeSecret: 'PROJEN_GITHUB_TOKEN',

  publishToPypi: {
    module: 'cfunctions',
    distName: 'cfunctions',
  },
  depsUpgradeOptions: {
    // see https://github.com/cdklabs/cfunctions/issues/145
    exclude: ['esbuild'],
  },
  autoApproveOptions: {
    allowedUsernames: ['cdklabs-automation'],
    secret: 'GITHUB_TOKEN',
  },
  autoApproveUpgrades: true,
});

project.addBundledDeps('fs-extra@8');
project.addDevDeps('@types/fs-extra@8', 'esbuild');

// since it's a native module we have to rely on consumer to install it on their system
// project.addPeerDeps('esbuild@^0.8.21');

project.synth();
