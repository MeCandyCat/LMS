const {
    SlashCommandBuilder,
    ChannelType,
    PermissionsBitField,
    EmbedBuilder,
    ButtonBuilder,
    ActionRowBuilder,
    ButtonStyle,
    TimestampStyles,
} = require("discord.js");

module.exports = {
    perms: {
        create: ["teacher", "admin"],
        send: ["teacher", "admin", "student"],
    },
    data: new SlashCommandBuilder()
        .setName("assignment")
        .setDescription("Create or send finished assignment.")
        .addSubcommand((subcommand) =>
            subcommand
                .setName("send")
                .setDescription("Submit your finished assignment.")
                .addStringOption((option) =>
                    option.setName("id").setDescription("Assignment ID. (check your class channel)").setRequired(true)
                )
                .addAttachmentOption((option) =>
                    option
                        .setName("assignment")
                        .setDescription("Your finished assignment. (we recommend a pdf document)")
                        .setRequired(true)
                )
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("create")
                .setDescription("Create an assignment.")
                .addAttachmentOption((option) =>
                    option.setName("assignment").setDescription("Import the assignment.").setRequired(true)
                )
                .addStringOption((option) =>
                    option
                        .setName("description")
                        .setDescription("This will be shown in the embed message of the Assingment.")
                )
        ),
    async execute(interaction, Mongo) {
        let guild = interaction.guild;
        let assignment = interaction.options.getAttachment("assignment");
        switch (interaction.options.getSubcommand()) {
            case "create": {
                let desc = interaction.options.getString("description");
                let num = Math.floor(Math.random() * 9000) + 1000;
                let channel = await guild.channels.create({
                    name: `assignment-${num}`,
                    type: ChannelType.GuildText,
                    parent: interaction.channel.parent.id,
                    permissionOverwrites: [
                        {
                            id: guild.id,
                            deny: [PermissionsBitField.Flags.ViewChannel],
                        },
                        {
                            id: interaction.user.id,
                            allow: [PermissionsBitField.Flags.ViewChannel],
                        },
                    ],
                    topic: `Assingment sent for ${interaction.channel}.`,
                });

                let embed = new EmbedBuilder()
                    .setColor("#7b2eff")
                    .setTitle("You Got a New Assignment")
                    .addFields({
                        name: "Description",
                        value: `${desc ? desc : ""} \n\nAssignment ID: **${channel.id}**`,
                        inline: false,
                    })
                    .setTimestamp();

                interaction.reply({
                    content: `Channel created at ${channel}`,
                    ephemeral: true,
                });

                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setLabel("Download Assignment")
                        .setURL(assignment.url)
                        .setStyle(ButtonStyle.Link)
                );
                await Mongo.createAssignment(channel.id);
                await interaction.channel.send({
                    embeds: [embed],
                    components: [row],
                });
                break;
            }
            case "send": {
                let embed = new EmbedBuilder()
                    .setColor("#7b2eff")
                    .setTitle("Submission!")
                    .setThumbnail(interaction.user.avatarURL())
                    .setDescription(
                        `Student ${interaction.user} have submitted. \n Download [here](${assignment.url}) or click the button below`
                    )
                    .setTimestamp();

                const button = new ButtonBuilder()
                    .setLabel("Download Assignment")
                    .setURL(assignment.url)
                    .setStyle(ButtonStyle.Link);
                const deleteBtn = new ButtonBuilder()
                        .setCustomId('assignmentDel')
                        .setLabel("Close channel")
                        .setStyle(ButtonStyle.Danger)
                const row = new ActionRowBuilder().addComponents(button, deleteBtn);
                let assignmentId = interaction.options.getString("id");
                if (await Mongo.doesAssignmentExists(assignmentId)) {
                    let channel = await interaction.client.channels.fetch(assignmentId);
                    channel
                        .send({
                            embeds: [embed],
                            components: [row],
                        })
                        .then(() => {
                            interaction.reply({
                                content: "**Assignment successfully submitted!**",
                                ephemeral: true,
                            });
                        });
                } else {
                    interaction.reply({
                        content:
                            "**Something went wrong!** Maybe wrong Assignment ID or your teacher stopped accepting answers.",
                        ephemeral: true,
                    });
                }
                break;
            }
        }
    },
};
