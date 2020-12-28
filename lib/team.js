function Team({ name, link }) {
    this.name = name;
    this.link = link;
}
Team.prototype.getRoster = async function () { }

module.exports = Team;