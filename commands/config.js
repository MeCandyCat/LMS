const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
module.exports = {
    perms: {
        role: ["admin"],
        self_register: ["admin"],
        view: ["admin"],
    },
    data: new SlashCommandBuilder()
        .setName("config")
        .setDescription("Configur server settings.")
        .addSubcommand((subcommand) =>
            subcommand
                .setName("role")
                .setDescription("Set-up server roles.")
                .addStringOption((option) =>
                    option
                        .setName("user")
                        .setDescription("Choose one of the 3 roles.")
                        .setRequired(true)
                        .addChoices(
                            { name: "teacher", value: "teacher" },
                            { name: "student", value: "student" },
                            { name: "admin", value: "admin" }
                        )
                        .setRequired(true)
                )
                .addRoleOption((option) =>
                    option.setName("role").setDescription("The role you need to assign.").setRequired(true)
                )
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("selfregister")
                .setDescription("Set wheather a student can register them self.")
                .addBooleanOption((option) =>
                    option.setName("set").setDescription("set true or false").setRequired(true)
                )
        )
        .addSubcommand((subcommand) => subcommand.setName("view").setDescription("View your current config")),
    async execute(interaction, Mongo) {
        let guild = interaction.guild;
        switch (interaction.options.getSubcommand()) {
            case "role": {
                let role = interaction.options.getRole("role").id;
                let type = interaction.options.getString("user");
                await Mongo.addToConfig(guild.id, "roles", type, role);
                await interaction.reply(`You have successfully configured \`${type}\` to <@&${role}>`);
                break;
            }
            case "selfregister": {
                let set = interaction.options.getBoolean("set");
                await Mongo.addToConfig(guild.id, "perms", "selfRegister", set).then(() => {
                    interaction.reply(`Now students ${set ? "can" : "can't"} register by themselves`);
                });
                break;
            }
            case "view": {
                let config = await Mongo.getConfig(guild.id);
                let roles = "";
                let selfReg;
                try {
                    roleConf = config["roles"];
                } catch (e) {
                    roleConf = {};
                }
                const undefinedMsg = "**Please configure the role.**";
                const admin = roleConf["admin"];
                const teacher = roleConf["teacher"];
                const student = roleConf["student"];
                roles = `> Admin:  ${admin ? await guild.roles.fetch(admin) : undefinedMsg}
                            > Teacher:  ${teacher ? await guild.roles.fetch(teacher) : undefinedMsg}
                            > Student:  ${student ? await guild.roles.fetch(student) : undefinedMsg}
                            
                            *use </config role:1070904796070039613> to configure roles.*`;
                try {
                    selfReg = config.perms.selfRegister;
                } catch {
                    selfReg = "undefined";
                }
                let embed = new EmbedBuilder()
                    .setTitle("Your server's current configuration.")
                    .addFields(
                        { name: "Roles", value: roles },
                        {
                            name: "Self Registration",
                            value: `\`${selfReg}\`\n*use </config self-register:1070904796070039613> to set-up.*`,
                        }
                    )
                    .setColor("Green")
                    .setThumbnail("https://i.imgur.com/ABGHLdd.png");
                interaction.reply({ embeds: [embed] });
            }
        }
    },
};
