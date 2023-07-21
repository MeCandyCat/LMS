const { Events } = require("discord.js");

let doesHavePerm = async (interaction, command, Mongo) => {
    let hasPerm = true;
    try {
        let perms;
        if (command?.perms) {
            if (Array.isArray(command.perms)) {
                perms = command.perms;
            } else {
                perms = command.perms[interaction.options.getSubcommand()];
            }
        }
        if (perms) {
            hasPerm = await Mongo.hasPerm(interaction, perms).catch((e) => {
                return "notConfigured";
            });
        }
    } catch (e) {
        console.log(e);
        hasPerm = "error";
    }

    return hasPerm;
};

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction, Mongo) {
        if (interaction.isChatInputCommand()) {
            const command = interaction.client.commands.get(interaction.commandName);
            let hasPerms = await doesHavePerm(interaction, command, Mongo);
            switch (hasPerms) {
                case false:
                    await interaction.reply({
                        content: "You don't have permission to run this command.",
                        ephemeral: true,
                    });
                    return;
                case true:
                    await command.execute(interaction, Mongo);
                    return;
                case "notConfigured":
                    await interaction.reply({ content: "Roles are not configured properly.", ephemeral: true });
                    return;
                case "error":
                    await interaction.reply("Something went wrong.");
            }
        }
        if (interaction.isButton()) {
            if (interaction.customId == "assignmentDel") {
                await Mongo.deleteAssignment(interaction.channel.id);
                await interaction.channel.delete();
            }
        }
    },
};
