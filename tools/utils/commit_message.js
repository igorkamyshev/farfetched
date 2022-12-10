module.exports = {
  getAddMessage(changeset) {
    return changeset.summary;
  },
  getVersionMessage(releasePlan) {
    // We uses fixed version numbers for all packages
    const version = releasePlan.releases
      .filter((release) => release.type !== 'none')
      .at(0).newVersion;

    return `Release ${version}`;
  },
};
