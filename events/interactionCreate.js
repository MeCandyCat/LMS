const { Events } = require("discord.js");

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction, Mongo) {
        if (interaction.isChatInputCommand()) {
            const command = interaction.client.commands.get(interaction.commandName);

            if (!command) {
                console.error(`No command matching ${interaction.commandName} was found.`);
                return;
            }
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
                        interaction.reply("Please ask server admin to configure roles properly.");
                        return;
                    });
                    if (!hasPerm) {
                        await interaction.reply("You don't have permission to run this command.");
                        return;
                    }
                }

                await command.execute(interaction, Mongo);
            } catch (error) {
                console.error(`Error executing ${interaction.commandName}`);
                console.error(error);
            }
        }
        if (interaction.isButton()) {
            if (interaction.customId == "assignmentDel") {
                await Mongo.deleteAssignment(interaction.channel.id)
                await interaction.channel.delete();
            }
        }
    },
};
