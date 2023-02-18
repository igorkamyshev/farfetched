import { Octokit } from '@octokit/rest';

import coreTeamMembers from './core_team.data.json' assert { type: 'json' };

export default {
  async load() {
    const octokit = new Octokit();

    const coreTeamAccounts = coreTeamMembers.map(getGitHubAccount);

    const response = await octokit.repos.listContributors({
      owner: 'igorkamyshev',
      repo: 'farfetched',
    });

    return response.data
      .filter((item) => item.html_url && item.login)
      .map((item) => ({
        avatar: item.avatar_url,
        name: item.login,
        links: [{ icon: 'github', link: item.html_url }],
      }))
      .filter((user) => !coreTeamAccounts.includes(getGitHubAccount(user)))
      .filter(
        (user) =>
          getGitHubAccount(user) !== 'https://github.com/apps/github-actions'
      );
  },
};

function getGitHubAccount(user) {
  return user.links
    .filter(({ icon }) => icon === 'github')
    .map(({ link }) => link)
    .at(0);
}
