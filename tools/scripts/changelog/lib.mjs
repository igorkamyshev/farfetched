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
