const { SlashCommandBuilder, ActionRowBuilder,ButtonBuilder,ButtonStyle, EmbedBuilder } = require("discord.js");
const { imgbb } = require("../config.json");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("imgbb")
        .setDescription("Upload a image and get a url.")
        .addAttachmentOption((option) =>
            option.setName("image").setDescription("The image you want to upload.").setRequired(true)
        ),
    async execute(interaction) {
        await interaction.deferReply()
        let image = await interaction.options.getAttachment("image");
        var body = await new FormData();
        body.append("image", image.url);
        let res = await fetch(`https://api.imgbb.com/1/upload?key=${imgbb}`, { method: "POST", body })
            .then((response) => response.json())
            .then((data) => data);
        try {
            let imgUrl = res["data"]["url"];
            let embed = new EmbedBuilder()
                .setTitle("Successfully uploaded!")
                .setDescription("**Copy the link below:**\n\n```" + `${imgUrl}` + "```")
                .setImage(imgUrl)
                .setColor("Green")
                .setThumbnail("https://cdn.discordapp.com/attachments/1071270393442213968/1073094994858090588/setting.png");
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setURL(imgUrl)
                    .setLabel("Open Image")
                    .setStyle(ButtonStyle.Link)
                    .setEmoji({id:'1072082665433481231'})
            );
            await interaction.editReply({ embeds: [embed], components: [row] });
        } catch (e) {
            console.log(e);
            await interaction.editReply({
                content: "Something went wrong. Are you sure you uploaded an image?",
                ephemeral: true,
            });
        }
    },
};
