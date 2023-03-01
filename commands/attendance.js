const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
    perms: ["teacher", "admin"],
    data: new SlashCommandBuilder()
        .setName("attendance")
        .setDescription("Attendance commands.")
        .addSubcommand((subcommand) =>
            subcommand
                .setName("mark")
                .setDescription("Note down all the members in the VC.")
                .addChannelOption((option) =>
                    option.setName("channel").setDescription("The channel you need to mark attendance of.")
                )
        ),
    async execute(interaction) {
        let guild = interaction.guild;
        let channel = await interaction.options.getChannel("channel");
        let userVc = channel ? channel : await interaction.member.voice.channel;
        if (!userVc.isVoiceBased()) {
            await interaction.reply({ content: "The mentioned channel is not a vc.", ephemeral: true });
            return;
        }
        let members = "";
        await userVc.members.forEach((member) => {
            members += `${member.user.tag} | ${member}\n`;
        });

        switch (interaction.options.getSubcommand()) {
            case "mark": {
                let embed = new EmbedBuilder()
                    .setTitle("Meeting Attendance List")
                    .setDescription(`**VC**: ${userVc}\n\n`)
                    .addFields({ name: "Members In the VC", value: `${members ? members : "`None`"}` })
                    .setColor("#b452ff")
                    .setTimestamp()
                    .setThumbnail("https://i.imgur.com/z4fIFA0.png");
                let invite = await userVc.createInvite()
                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setURL(invite.url).setLabel(`Join ${userVc.name}`).setStyle(ButtonStyle.Link)
                );
                await interaction.reply({ embeds: [embed], components:[row]});
            }
        }
    },
};
