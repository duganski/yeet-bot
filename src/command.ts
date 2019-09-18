import { Message } from 'discord.js'

import { client } from './client'
import { getCoin, top10 } from './util/crypto'
import { DAB } from './util/emoji'
import { addQuote, getQuote } from './util/quotes'

const HELP: string = "Here's what I can do:\n\n" 
  + "`\!yeet crypto` Prices out the top 10 cryptocurrencies, you can get more specific info on a currency by specifying a name.\n\n"
  + "`\!yeet dab` Uhh...\n\n"
  + "`\!yeet game` Set the bot's game\n\n"
  + "`\!yeet nick` Change the bot's nickname on a given server.  You _need_ to give it the right permissions for this to work.\n\n"
  + "`\!yeet say` Says a thing.\n\n"
  + "`\!yeet shitpost` Markov chain for the Text Channel.\n\n"
  + "`\!yeet beperson` Markov chain for Jordan Beperson.\n\n"
  + "`\!yeet yell` Like say, but with text to speech."

export function runCommand(message: Message, command: string, args?: string) {
  console.log('Running "' + command + '" with args:', args || 'none')

  switch(command.toLowerCase()) {
    case 'crypto':
      crypto(message, args)
      break
    case 'dab':
      say(message, DAB)
      break
    case 'game':
      client.user.setGame(args ? args : '\!yeet help')
      say(message, DAB)
      break
    case 'help':
      say(message, HELP)
      break
    case 'nick':
      message.guild.members.get(client.user.id).setNickname(args ? args : 'YeetBot')
      say(message, DAB)
      break
    case 'say':
      say(message, args)
      break
    case 'quote':
      quote(message, args)
      break
    case 'yell':
      say(message, args, true)
      break
    case 'shitpost':
      shitpost(message, args)
      break
    case 'beperson':
      beperson(message, args)
      break
    default:
      say(message, "I don't recognize that command...")
      say(message, HELP)
      break
  }
}

async function crypto(message: Message, currency?: string) {
  try {
    if (currency && currency.split(' ')[0] !== 'watch') {
      say(message, await getCoin(currency))
    } else if(currency && currency.split(' ')[0] === 'watch') {
      say(message, "That feature is coming soon...")
    } else {
      say(message, await top10())
    }
  } catch(e) {
    console.error(e)
    say(message, "Uh oh... I had some trouble grabbing the info, try again later!")   
  }
}

function say(message: Message, note?: string, tts?: boolean) {
  if (note) {
    message.channel.send(note, {tts: tts})
  } else {
    message.channel.send(DAB + "try that again" + DAB, {tts: tts})
  }
}

async function quote(message: Message, user?: string) {
  if (user) {
    let msgs = await message.channel.fetchMessages({limit: 10})
    let msg: Message = null
    msgs.forEach((m) => {
      if (m.author.toString() === user && !msg) {
        msg = m
      }
    })

    if (msg) {
      addQuote(user, msg.content)
      say(message, DAB)
    }
  } else {
    let quote = await getQuote()
    say(message, '```\n' + quote.text + '\n```\n\n' + quote.author + ' on ' + quote.date)
  }
}

async function shitpost(message: Message, argument?: string) {
  const MarkovGen = require('markov-generator');
  let data = []
  let sentence = ""
  let msgs = await message.channel.fetchMessages({limit: 100})
  let usernameStripped = ""
  let keyword = ""
  let user = ""
  if(argument.charAt(0) === "<"){
    user = argument;
    usernameStripped = argument.substring(2,argument.length-1)
    if ( usernameStripped.charAt(0) === "!") {
      usernameStripped = usernameStripped.substring(1,usernameStripped.length)
    }
  }
  else {
    keyword = argument
  }
  

  for( var i = 0; i < 20; i++) {
    msgs.forEach((m) => {
      if (user) {
        if (m.author.id === usernameStripped ) {
          data.push(m.toString())
        }
      }
      else if (keyword) {
        if (m.toString().includes(keyword)){
          data.push(m.toString())
        }
      }
      else if (!(m.author.username === "YeetBot") ) {
        data.push(m.toString())
      }
    })
    try {
      msgs = await message.channel.fetchMessages({limit: 100, before: msgs.last().id})
    }
    catch {
      break
    }
  }

  if ( data.length === 0 ) {
    sentence = "Error creating shitpost"
    say(message, sentence )
  }
  else {
    let markov = new MarkovGen({
      input: data,
      minLength: 7
    });
    sentence = markov.makeChain();
    if(user.length === 0) { 
      user = "<@390535530800218115>"
    }
    say(message, '\n' + sentence + '\n' + user )
  }
}

async function beperson(message: Message, argument?: string) {
  const MarkovGen = require('markov-generator');
  let fs = require("fs");
  const path = require("path");
  let data = []
  let sentence = ""
  let msgs = []
  let keyword = argument

  let text = fs.readFileSync(path.resolve(__dirname, '../src/text/beperson.txt')).toString('utf-8');
  msgs = text.split("\n");

  msgs.forEach((m) => {
    if (keyword) {
      if (m.toString().includes(keyword)){
        data.push(m.toString())
      }
    }
    else {
      data.push(m.toString())
    }
  })

  if ( data.length === 0 ) {
    sentence = "Error creating shitpost"
    say(message, sentence )
  }
  else {
    let markov = new MarkovGen({
      input: data,
      minLength: 7
    });
    sentence = markov.makeChain();
    say(message, '\n' + sentence + '\n' + "-:regional_indicator_j:ordan :b:eperson-" )
  }
}