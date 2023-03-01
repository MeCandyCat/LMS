const { SlashCommandBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("nasio")
        .setDescription("Get bot updates, tutorials, events and more. Join our nas.io page."),

    async execute(interaction) {
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setURL("https://nas.io/l").setLabel("Nas.io Page").setStyle(ButtonStyle.Link)
        );
        await interaction.reply({
            content: "Get tutorials events and more. Join our NasIo page!",
            ephemeral: true,
            components: [row],
        });
    },
};
