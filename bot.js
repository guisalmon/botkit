/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
           ______     ______     ______   __  __     __     ______
          /\  == \   /\  __ \   /\__  _\ /\ \/ /    /\ \   /\__  _\
          \ \  __<   \ \ \/\ \  \/_/\ \/ \ \  _"-.  \ \ \  \/_/\ \/
           \ \_____\  \ \_____\    \ \_\  \ \_\ \_\  \ \_\    \ \_\
            \/_____/   \/_____/     \/_/   \/_/\/_/   \/_/     \/_/


This is a sample Slack bot built with Botkit.

This bot demonstrates many of the core features of Botkit:

* Connect to Slack using the real time API
* Receive messages based on "spoken" patterns
* Reply to messages
* Use the conversation system to ask questions
* Use the built in storage system to store and retrieve information
  for a user.

# RUN THE BOT:

  Get a Bot token from Slack:

    -> http://my.slack.com/services/new/bot

  Run your bot from the command line:

    token=<MY TOKEN> node bot.js

# USE THE BOT:

  Find your bot inside Slack to send it a direct message.

  Say: "Hello"

  The bot will reply "Hello!"

  Say: "who are you?"

  The bot will tell you its name, where it running, and for how long.

  Say: "Call me <nickname>"

  Tell the bot your nickname. Now you are friends.

  Say: "who am I?"

  The bot will tell you your nickname, if it knows one for you.

  Say: "shutdown"

  The bot will ask if you are sure, and then shut itself down.

  Make sure to invite your bot into other channels using /invite @<my bot>!

# EXTEND THE BOT:

  Botkit is has many features for building cool and useful bots!

  Read all about it here:

    -> http://howdy.ai/botkit

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/


if (!process.env.token) {
    console.log('Error: Specify token in environment');
    process.exit(1);
}

var Botkit = require('./lib/Botkit.js');
var os = require('os');

var controller = Botkit.slackbot({
    debug: true,
});

var bot = controller.spawn({
    token: process.env.token
}).startRTM();


controller.hears(['hello','hi'],'direct_message,direct_mention,mention',function(bot, message) {

    bot.api.reactions.add({
        timestamp: message.ts,
        channel: message.channel,
        name: 'robot_face',
    },function(err, res) {
        if (err) {
            bot.botkit.log('Failed to add emoji reaction :(',err);
        }
    });


    controller.storage.users.get(message.user,function(err, user) {
        if (user && user.name) {
            bot.reply(message,'Hello ' + user.name + '!!');
        } else {
            bot.reply(message,'Hello.');
        }
    });
});

controller.hears(['call me (.*)'],'direct_message,direct_mention,mention',function(bot, message) {
    var matches = message.text.match(/call me (.*)/i);
    var name = matches[1];
    controller.storage.users.get(message.user,function(err, user) {
        if (!user) {
            user = {
                id: message.user,
            };
        }
        user.name = name;
        controller.storage.users.save(user,function(err, id) {
            bot.reply(message,'Got it. I will call you ' + user.name + ' from now on.');
        });
    });
});

controller.hears(['what is my name','who am i'],'direct_message,direct_mention,mention',function(bot, message) {

    controller.storage.users.get(message.user,function(err, user) {
        if (user && user.name) {
            bot.reply(message,'Your name is ' + user.name);
        } else {
            bot.reply(message,'I don\'t know yet!');
        }
    });
});


controller.hears(['shutdown'],'direct_message,direct_mention,mention',function(bot, message) {

    bot.startConversation(message,function(err, convo) {

        convo.ask('Are you sure you want me to shutdown?',[
            {
                pattern: bot.utterances.yes,
                callback: function(response, convo) {
                    convo.say('Bye!');
                    convo.next();
                    setTimeout(function() {
                        process.exit();
                    },3000);
                }
            },
        {
            pattern: bot.utterances.no,
            default: true,
            callback: function(response, convo) {
                convo.say('*Phew!*');
                convo.next();
            }
        }
        ]);
    });
});


controller.hears(['uptime','identify yourself','who are you','what is your name'],'direct_message,direct_mention,mention',function(bot, message) {

    var hostname = os.hostname();
    var uptime = formatUptime(process.uptime());

    bot.reply(message,':robot_face: I am a bot named <@' + bot.identity.name + '>. I have been running for ' + uptime + ' on ' + hostname + '.');

});


controller.hears(['Salut', 'Coucou', 'Plop', 'Hey'],['direct_message','direct_mention','mention','ambient'],function(bot, message) {

    bot.reply(message, 'Hello and, again, welcome to the Aperture Science computer-aided enrichment center.');

});


controller.hears(['Glados','glados','portal'],['direct_message','direct_mention','mention','ambient'],function(bot,message) {
    bot.reply(message, 'It\'s been a long time. How have you been?');
});


controller.hears(['blbl','mouarf','Portal'],['direct_message','direct_mention','mention','ambient'],function(bot,message) {
  bot.reply(message, 'Did you just stuff that Aperture Science Thing We Don\'t Know What It Does into an Aperture Science Emergency Intelligence Incinerator?');
});


controller.hears(['connard', 'enfoiré', 'enflure', 'connasse', 'raclure'], ['direct_message','direct_mention','mention','ambient'],function(bot, message) {
  bot.reply(message, 'You think you\'re doing some damage? Two plus two is... ten. IN BASE FOUR! I\'M FINE!');
});


controller.hears(['birthday', 'anniversaire', 'bday', 'naissance'], ['direct_message','direct_mention','mention','ambient'],function(bot, message) {
  bot.reply(message, 'You know how I\'m going to live forever, but you\'re going to be dead in sixty years? Well, I\'ve been working on a belated birthday present for you. Well... more of a belated birthday medical procedure. Well. Technically, it\'s a medical EXPERIMENT. What\'s important is, it\'s a present.');
});

controller.hears(['je crois'], ['direct_message','direct_mention','mention','ambient'],function(bot, message) {
  bot.reply(message, 'I don\'t think so');
});

controller.hears(['lol'], ['direct_message','direct_mention','mention','ambient'],function(bot, message) {
  bot.reply(message, 'Your entire life has been a mathematical error. A mathematical error I\'m about to correct.');
});

controller.hears(['Ciel que tu es drôle !', 'J\'ai tellement ri que je crois m\'être démi une côte. Ou bien c\'était le massage de @cyke.', 'xptdr l0uulZ'], ['ambient'], function(bot, message) {
    bot.reply(message, 'I\'m considering to terminate the personality construct android Slackbot, just for fun.');
});

controller.hears(['Please, do so!'], ['direct_mention', 'direct_message', 'mention'], function(bot, message) {
    bot.reply(message, '/kill @slackbot');
    setTimeout(function () {
        bot.reply(message, 'He is insensitive to my neurotoxin, but science improves every day !');
    }, 2000);
});


function formatUptime(uptime) {
    var unit = 'second';
    if (uptime > 60) {
        uptime = uptime / 60;
        unit = 'minute';
    }
    if (uptime > 60) {
        uptime = uptime / 60;
        unit = 'hour';
    }
    if (uptime != 1) {
        unit = unit + 's';
    }

    uptime = uptime + ' ' + unit;
    return uptime;
}
