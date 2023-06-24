const { MongoClient } = require("mongodb");
const { mongodb } = require("./config.json");

const client = new MongoClient(mongodb);
const db = client.db("lmsdb");
const configCollection = db.collection("settings");
const classesCollection = db.collection("classes");
const assignmentsCollection = db.collection("assignments")

let getConfig = async (guildId) => {
    return await configCollection.findOne({ _id: guildId });
};
let addToConfig = async (guildId, type, config, value) => {
    const res = await configCollection.updateOne(
        { _id: guildId },
        { $set: { [`${type}.${config}`]: value } },
        { upsert: true }
    );
};

let hasPerm = async (interaction, perms) => {
    try {
        if (interaction.guild.ownerId == interaction.user.id) {
            return true
        }
        const conf = await configCollection.findOne({ _id: interaction.guild.id }, { roles: 1, _id: 0 });
        const roles = conf["roles"];
        if ("owner" in perms) {
            return false
        }

        const memberRoles = interaction.member.roles.cache;
        for (perm of perms) {
            if (memberRoles.has(roles[perm])) {
                return true;
            }
        }
        return false;
    } catch (e) {
        throw e;
    }
};

let createClass = async (guildId, categoryId, voiceId, textId, roleId) => {
    await classesCollection.insertOne({ _id: categoryId, guild: guildId, voice: voiceId, text: textId, role: roleId });
};

let getClass = async (categoryId, projection) => {
    return await classesCollection.findOne({ _id: categoryId }, projection);
};

let deleteClass = async (categoryId) => {
    return await classesCollection.deleteMany({ _id: categoryId });
};

let createAssignment = async (assignmentId) => {
    return await assignmentsCollection.insertOne({_id: assignmentId})
}

let deleteAssignment = async (assignmentId) => {
    return await assignmentsCollection.deleteOne({_id:assignmentId}) 
}

let doesAssignmentExists = async (assignmentId) => {
    let assignment  = await assignmentsCollection.findOne({_id:assignmentId})
    try {

        if ( assignment._id === assignmentId) {
            return true
        }
    } catch { return false}
}

module.exports = { addToConfig, getConfig, hasPerm, createClass, getClass, deleteClass, createAssignment, deleteAssignment, doesAssignmentExists };