const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
} = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder().setName("embed").setDescription("Create an embed in the current channel."),
    async execute(interaction) {
        const modal = new ModalBuilder().setCustomId("embedBuilder").setTitle("Embed Builder");

        const title = new TextInputBuilder()
            .setCustomId("title")
            // The label is the prompt the user sees for this input
            .setLabel("Title")
            // Short means only a single line of text
            .setStyle(TextInputStyle.Short)
            .setRequired(false);

        const description = new TextInputBuilder()
            .setCustomId("description")
            .setLabel("Embed body description")
            // Paragraph means multiple lines of text.
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(false);
        const smolImage = new TextInputBuilder()
            .setCustomId("smallImage")
            .setLabel("Small image link")
            // Paragraph means multiple lines of text.
            .setStyle(TextInputStyle.Short)
            .setRequired(false);
        const bigImage = new TextInputBuilder()
            .setCustomId("bigImage")
            .setLabel("Big image link")
            // Paragraph means multiple lines of text.
            .setStyle(TextInputStyle.Short)
            .setRequired(false);

        const color = new TextInputBuilder()
            .setCustomId("color")
            .setLabel("Color")
            .setStyle(TextInputStyle.Short)
            .setRequired(false)
            .setValue("#2e9eef");
        // An action row only holds one text input,
        // so you need one action row per text input.
        const firstActionRow = new ActionRowBuilder().addComponents(title);
        const secondActionRow = new ActionRowBuilder().addComponents(description);
        const thirdActionRow = new ActionRowBuilder().addComponents(smolImage);
        const fourthActionRow = new ActionRowBuilder().addComponents(bigImage);
        const fifthActionRow = new ActionRowBuilder().addComponents(color);

        // Add inputs to the modal
        modal.addComponents(firstActionRow, secondActionRow, thirdActionRow, fourthActionRow, fifthActionRow);

        await interaction.showModal(modal);

        const modelFilter = (i) => i.customId === "embedBuilder";

        try {
            await interaction.awaitModalSubmit({ filter: modelFilter, time: 60000 }).then(async (interaction) => {
                let embed = {
                    title: interaction.fields.getTextInputValue("title"),
                    description: interaction.fields.getTextInputValue("description"),
                    thumbnail: {
                        url: interaction.fields.getTextInputValue("smallImage"),
                    },
                    image: {
                        url: interaction.fields.getTextInputValue("bigImage"),
                    },
                    color: Number(interaction.fields.getTextInputValue("color").replace("#", "0x")) || 0x2b2d31,
                };
                await interaction.reply({ embeds: [embed] });
            });
        } catch (_) {}
    },
};
