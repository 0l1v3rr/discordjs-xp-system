const Discord = require("discord.js");
const bot = new Discord.Client({ partials: ["MESSAGE", "USER", "REACTION"]});
const xp = require('./xp.json');
const fs = require('fs');

bot.on("ready", async () => {
    console.log('The bot is active.');
    bot.user.setActivity('!rank', {type: 'LISTENING'});
});

bot.on('message', async message => {
    if (message.author.bot || message.channel.type === 'dm') return;
    let prefix = '!';
    let messageArray = message.content.split(" ");
    let cmd = messageArray[0].toLowerCase();
    let args = messageArray.slice(1);

    const randomxp = Math.floor(Math.random() * 10) + 5;
    if (!xp[message.author.id]) {
        xp[message.author.id] = {
            xp: 0,
            level: 0,
            xpToNextLvl: 100,
            allmessages: 0
        }

        fs.writeFile("./xp.json", JSON.stringify(xp), error => {
            if (error) console.log(error);
        });
    }

    xp[message.author.id].xp += randomxp;
    xp[message.author.id].allmessages += 1;

    if(xp[message.author.id].xp > xp[message.author.id].xpToNextLvl) {
        xp[message.author.id].xpToNextLvl *= 2.55;
        xp[message.author.id].xpToNextLvl = Math.floor(xp[message.author.id].xpToNextLvl);
        xp[message.author.id].level += 1;

        const lvlup = new Discord.MessageEmbed()
        .setDescription(`${message.author} just advanced to lvl ${xp[message.author.id].level}!`)
        .setTimestamp()
        .setColor("#55ff55");
        message.channel.send(lvlup);
    }

    fs.writeFile("./xp.json", JSON.stringify(xp), err => {
        if (err) console.log(err);
    });

    if (cmd === `${prefix}rank`) {
        const user = message.author || message.mentions.users.first();

        const rank = new Discord.MessageEmbed()
        .setColor("#4285ff")
        .setTitle(user.username)
        .setDescription(`XP: **${xp[user.id].xp}**/**${xp[user.id].xpToNextLvl}**\nLevel: **${xp[user.id].level}**\nTotal messages: **${xp[user.id].allmessages}**`)
        .setTimestamp();
        message.channel.send(rank);
    }

    if (cmd === `${prefix}leaderboard` || cmd === `${prefix}lb`) {
        let users = JSON.parse(fs.readFileSync("./xp.json"));
        let sort = Object.entries(users).sort((x, y) => y[1].xp - x[1].xp);
        if (sort.length > 10) sort = sort.slice(0, 10);

        let lb = "";
        let n = 0;
        sort.forEach((user) => {
            n++;
            lb += `${n}. ${bot.users.cache.find(u => u.id === user[0]).username} (${user[1].xp} xp)`;
        });

        const leaderboard = new Discord.MessageEmbed()
        .setTitle("Leaderboard")
        .setColor("#4285ff")
        .setTimestamp()
        .setDescription(lb);
        message.channel.send(leaderboard);
    }

});

bot.login('YOUR-TOKEN'); //YOUR TOKEN GOES HERE.