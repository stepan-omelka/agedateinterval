import type { UserConfig } from '@commitlint/types';

/** Scopes are the project folders; leave the scope out for a repo-wide change. */
const PROJECTS = ['web', 'api', 'shared'];

const config: UserConfig = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': [2, 'always', PROJECTS],
  },
};

export default config;
