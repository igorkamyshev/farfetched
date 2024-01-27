import glob from 'glob';
import { readFile, writeFile } from 'node:fs/promises';
import { promisify } from 'node:util';
import { markdown } from 'markdown';
import { format } from 'prettier';
import { NodeHtmlMarkdown } from 'node-html-markdown';
import { parseSemVer, compareSemVer } from 'semver-parser';
import { resolve } from 'node:path';

import { groupByVersions } from './lib.mjs';

const files = await promisify(glob)(
  '../../{packages,deleted_packages}/*/CHANGELOG.md',
  {
    absolute: true,
  }
);

const changelogs = await Promise.all(
  files.map((file) =>
    readFile(file, 'UTF-8')
      .then((content) => content.toString())
      .then(parseChangelog)
  )
);

for (const [release, changelog] of mergeChangelogs(changelogs).entries()) {
  const md = renderChangelog(changelog);

  const releaseFile = release.replaceAll('.', '-');
  const filePath = resolve('docs/releases', `${releaseFile}.changelog.md`);

  await writeFile(filePath, md);
}

// --- // ---

function renderChangelog(tree) {
  return makeLinksOnCommits(
    format(
      NodeHtmlMarkdown.translate(
        markdown.renderJsonML(markdown.toHTMLTree(tree))
      ),
      {
        parser: 'markdown',
      }
    )
  );
}

function mergeChangelogs(packages) {
  const releases = new Set(
    Object.values(packages)
      .flatMap(({ changes }) => Object.keys(changes))
      .map(getRelease)
  );

  const log = new Map();

  for (const release of releases) {
    const currentLog = [[]];

    const relatedChanges = packages
      .map(({ name, changes }) => ({
        name,
        changes: Object.fromEntries(
          Object.entries(changes).filter(
            ([version]) => getRelease(version) === release
          )
        ),
      }))
      .filter(({ changes }) => Object.keys(changes).length > 0);

    currentLog.push(['header', { level: 2 }, 'Full changelog']);
    for (const { version, packages } of groupByVersions(relatedChanges).sort(
      ({ version: v1 }, { version: v2 }) => -compareSemVer(v1, v2)
    )) {
      const logForVersion = [];
      for (const { name: packageName, changes: packageChanges } of packages) {
        const pacakgeChangesEntries = Object.entries(packageChanges);

        let hasChanges = pacakgeChangesEntries.length > 0;

        if (!hasChanges) {
          continue;
        }

        logForVersion.push(['para', `::: details ${packageName}`]);

        for (const [type, items] of pacakgeChangesEntries) {
          logForVersion.push(['para', ['strong', type]], ...items);
        }

        logForVersion.push(['para', ':::']);
      }

      if (logForVersion.length > 0) {
        currentLog.push(['header', { level: 3 }, version]);
        currentLog.push(...logForVersion);
      }
    }

    log.set(release, currentLog);
  }

  return log;
}

async function parseChangelog(md) {
  const [_1, header, ...rest] = markdown.parse(md);

  const name = header.at(2);

  const versions = groupByLevel(2, rest);

  const changes = {};
  for (const [version, content] of Object.entries(versions)) {
    changes[version] = groupByLevel(3, content);
  }

  return { name, changes };
}

function groupByLevel(targetLevel, data) {
  const groups = {};

  let currentGroup;
  for (const item of data) {
    const { level } = item.at(1);

    if (level === targetLevel) {
      const group = item.at(2);
      currentGroup = group;
      groups[currentGroup] = [];
    } else {
      groups[currentGroup].push(item);
    }
  }

  return groups;
}

function getRelease(version) {
  const { major, minor } = parseSemVer(version);

  return `${major}.${minor}`;
}

function makeLinksOnCommits(content) {
  function linkToCommit(commitHash) {
    return `[${commitHash}](https://github.com/igorkamyshev/farfetched/commit/${commitHash})`;
  }

  function replacer(all, commitHash) {
    return all.replace(commitHash, linkToCommit(commitHash));
  }

  return content
    .replaceAll(/- ([0-9a-f]{7}):/gi, replacer)
    .replaceAll(/\\\[([0-9a-f]{7})\\\]/gi, replacer);
}
