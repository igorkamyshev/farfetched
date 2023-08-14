import { Octokit } from '@octokit/rest';

export default {
  async load() {
    const octokit = new Octokit();

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
