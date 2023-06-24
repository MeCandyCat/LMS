const { Events } = require("discord.js");

let doesHavePerm = async (interaction, command, Mongo) => {
    try {
        let perms;
        if (command.perms) {
            if (Array.isArray(command.perms)) {
                perms = command.perms;
            } else if (Array.isArray(command.perms[interaction.options.getSubcommand()])) {
                perms = command.perms[interaction.options.getSubcommand()];
            }
        }
        if (perms) {
            const hasPerm = await Mongo.hasPerm(interaction, perms).catch((e) => {
                // 2 means roles are not configured propperly
                return 2;
            });
            if (!hasPerm) {
                // 0 means no permission
                return 0;
            }
        }

        return 1;
    } catch (e) {
        console.log(e);
        return 4;
    }
};

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction, Mongo) {
        if (interaction.isChatInputCommand()) {
            const command = interaction.client.commands.get(interaction.commandName);
            let hasPerms = await doesHavePerm(interaction, command, Mongo);
            switch (hasPerms) {
                case 0:
                    await interaction.reply({
                        content: "You don't have permission to run this command.",
                        ephemeral: true,
                    });
                    return;
                case 1:
                    await command.execute(interaction, Mongo);
                    return;
                case 2:
                    await interaction.reply({ content: "Roles are not configured properly.", ephemeral: true });
                    return;
            }
            await interaction.reply("Something went wrong.");
        }
        if (interaction.isButton()) {
            if (interaction.customId == "assignmentDel") {
                await Mongo.deleteAssignment(interaction.channel.id);
                await interaction.channel.delete();
            }
        }
    },
};
