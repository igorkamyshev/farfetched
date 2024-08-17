export function groupByVersions(packages) {
  const groupedByVersions = [];

  for (const { name, changes } of packages) {
    for (const [version, versionChanges] of Object.entries(changes)) {
      const versionGroup = groupedByVersions.find(
        (group) => group.version === version
      );

      if (versionGroup) {
        versionGroup.packages.push({ name, changes: versionChanges });
      } else {
        groupedByVersions.push({
          version,
          packages: [{ name, changes: versionChanges }],
        });
      }
    }
  }

  return groupedByVersions;
}

export function excludeTrashUpdates(items) {
  return items
    .map((tags) => {
      const [header, ...body] = tags;

      const filteredBody = body
        .filter((item) => !isUpdatedDependenciesMessage(item))
        .filter((item) => !isPackageVersionBumpMessage(item));

      if (filteredBody.length === 0) {
        return null;
      }

      return [header, ...filteredBody];
    })
    .filter(Boolean);
}

function isUpdatedDependenciesMessage(item) {
  return item.at(1).toLowerCase().includes('updated dependencies');
}

function isPackageVersionBumpMessage(item) {
  if (!Array.isArray(item)) {
    return false;
  }

  if (item.at(0) === 'bulletlist') {
    return item.some(isPackageVersionBumpMessage);
  }

  if (item.at(0) !== 'listitem') {
    return false;
  }

  if (item.length === 2) {
    const message = item.at(1);
    const [org, pkgAndVersion] = message.split('/');
    const [pkg, version] = pkgAndVersion?.split('@') ?? [];

    if (!org || !pkg || !version) {
      return false;
    }

    return org === '@farfetched';
  } else {
    return item.some(isPackageVersionBumpMessage);
  }
}
