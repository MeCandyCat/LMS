const {
    SlashCommandBuilder,
    ChannelType,
    PermissionFlagsBits,
    Colors,
    EmbedBuilder,
    TimestampStyles,
} = require("discord.js");

module.exports = {
    perms: ["teacher", "admin"],
    data: new SlashCommandBuilder()
        .setName("class")
        .setDescription("Use this to create/delete classes.")
        .addSubcommand((subcommand) =>
            subcommand
                .setName("create")
                .setDescription("Create a classroom.")
                .addStringOption((option) =>
                    option.setName("subject").setDescription("Enter subject of the class.").setRequired(true)
                )
                .addUserOption((option) =>
                    option
                        .setName("teacher")
                        .setDescription("The teacher who is in charge of this class.")
                        .setRequired(true)
                )
                .addIntegerOption((option) =>
                    option
                        .setName("grade")
                        .setDescription("Grade of the students.")
                        .setMaxValue(100)
                        .setMinValue(0)
                        .setRequired(true)
                )
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("delete")
                .setDescription("Delete a created class.(cannot be undo!)")
                .addChannelOption((option) =>
                    option
                        .setName("class")
                        .setDescription(
                            "The category of the class that you need to delete.(every channel in here will be deleted)"
                        )
                        .setRequired(true)
                )
        ),
    async execute(interaction, Mongo) {
        let guild = interaction.guild;
        switch (interaction.options.getSubcommand()) {
            case "create": {
                await interaction.deferReply({ content: "Creating new class.", ephemeral: true });
                let serverConf = await Mongo.getConfig(guild.id);
                let teacherRole;
                try {
                    teacherRole = await guild.roles.fetch(serverConf["roles"]["teacher"]);
                } catch {
                    interaction.editReply("Please configure roles in the server.");
                    break;
                }
                let subject = interaction.options.getString("subject");
                let teacher = interaction.options.getMember("teacher");
                let grade = interaction.options.getInteger("grade");
                let channelName = subject + "-g" + grade;
                let role = await guild.roles.create({
                    name: channelName,
                    color: "Random",
                });
                teacher.roles.add(role);
                teacher.roles.add(teacherRole);
                let category = await guild.channels.create({
                    name: channelName,
                    type: ChannelType.GuildCategory,
                    permissionOverwrites: [
                        {
                            id: guild.id,
                            deny: [PermissionFlagsBits.ViewChannel],
                        },
                        {
                            id: teacher.id,
                            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ManageRoles],
                        },
                        {
                            id: role.id,
                            allow: [PermissionFlagsBits.ViewChannel],
                            deny: [PermissionFlagsBits.Connect],
                        },
                    ],
                });
                let channel = await guild.channels.create({
                    name: channelName,
                    type: ChannelType.GuildText,
                    parent: category.id,
                });

                let voice = await guild.channels.create({
                    name: channelName,
                    type: ChannelType.GuildVoice,
                    parent: category.id,
                });
                channel.setTopic(`${teacher}'s grade **${grade} ${subject}** class.`);
                channel.send({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle(`Welcome to class ${channelName}!`)
                            .setDescription(
                                `> Teacher: ${teacher}\n> Student Role: ${role}\n> Subject: ${subject}\n> Grade: ${grade}`
                            )
                            .setColor(Colors.Blue)
                            .setTimestamp(),
                    ],
                });
                await Mongo.createClass(guild.id, category.id, voice.id, channel.id, role.id);
                interaction.editReply(`New class has been created at ${channel}.`);
                break;
            }
            case "delete": {
                await interaction.deferReply({ ephemeral: true });
                let category = interaction.options.getChannel("class");
                let role;
                try {
                    ({ role } = await Mongo.getClass(category.id, { role: 1, _id: 0 }));
                } catch {
                    await interaction.editReply("That is not a class or it was not the category.");
                    return
                }
                let classRole = await guild.roles.fetch(role);
                category.children.cache.forEach((channel) => channel.delete());
                category.delete();
                classRole.delete();
                if ((await Mongo.deleteClass(category.id)) === 0) {
                    console.log("didnt delete database one");
                }
                await interaction.editReply("Successfully deleted the class!").catch(() => {
                    return;
                });
                break;
            }
        }
    },
};
