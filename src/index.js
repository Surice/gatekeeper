const Discord = require('discord.js');
const fs = require("fs");
const cron = require("cron");

const config = JSON.parse(fs.readFileSync(`${__dirname}/config.json`,'utf-8'));

const global = {
    channelId: '510370517824438282',
    targetId: '293373053059203072',
    owner: '279230092167872512'
}

let client = new Discord.Client();

console.log("Loading...");
client.on('ready', ()=>{
    console.log("---------------------------");
    console.log(client.user.username+ " successfully logged in!");
    console.log("---------------------------\n");

    client.user.setActivity(`for People`, {type: "WATCHING"});
});

client.on('voiceStateUpdate', async (oldMember, newMember) => {
    if(newMember.channel && newMember.channel.id == global.channelId && !oldMember.channel || newMember.channel && newMember.channel.id == global.channelId && oldMember.channel.id != global.channelId){
        oldMember.member.send("du bist in der Warteschlange. Bitte hab einen moment gedult");

        const me = await client.users.fetch(global.owner);
        me.send(`<@${oldMember.id}> wartet um gemovet zu werden!`).then(e =>{
            e.react('✅');
            e.react('❌');
        });
    }
});

client.on('messageReactionAdd', async (react, newMember) => {
    if(react.message.channel.type == "dm"){
        if(newMember.id == global.owner){
            let content = react.message.content.split(' ');
            var temp = content[0].substr(2).slice(0, -1);
            content[0] = temp;
    
            const chan = await client.channels.cache.get(global.targetId),
                wChan = await client.channels.cache.get(global.channelId),
                guild = chan.guild,
                member = guild.members.cache.get(content[0]);
    
            react.message.delete();
            if(!member.voice.channelID) return;
    
            if(react.emoji.name == '✅'){                
                member.voice.setChannel(chan);
            }else if(react.emoji.name == '❌'){
                member.voice.kick();
    
                wChan.createOverwrite(member, {
                    'CONNECT': false
                }).then(() => {
                    var j = cron.job('* */5 * * * *', function(){
                        wChan.createOverwrite(member, {
                            'CONNECT': true
                        });
                    });
    
                    j.start();
                });
            }
        }
    }
});



client.login(config.token);