const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    perms: ["teacher", "admin"],
    data: new SlashCommandBuilder()
        .setName("poll")
        .setDescription("Create a yes/no poll")
        .addStringOption((option) =>
            option
                .setName("question")
                .setDescription(
                    "The question you need to decide using the poll."
                )
                .setRequired(true)
        ),
    async execute(interaction) {
        const question = interaction.options.getString("question");
        if (!question.length) {
            interaction.reply(
                `You didn't provide a question, ${message.author}!`
            );
        }

        const pollEmbed = new EmbedBuilder()
            .setColor("#0099ff")
            .setTitle("Poll")
            .setDescription(question)
            .setFooter({ text: "React to vote", icon_url:interaction.user.avatarURL() });
        
        interaction.reply({content:"poll created", ephemeral:true})
        interaction.channel.send({ embeds: [pollEmbed] }).then((msg) => {
            msg.react("🔼");
            msg.react("🔽");
        });
    },
};
