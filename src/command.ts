import { Message } from 'discord.js'
import { formatCoin, getCoin, top10 } from './util/crypto'
import { DAB } from './util/emoji'

export function runCommand(message: Message, command: string, args: string[]) {
  console.log('Running "' + command + '" with args:', args)

  switch(command.toLowerCase()) {
    case 'crypto':
      if (args.length > 0) {
        crypto(message, args[0])
      } else {
        crypto(message)
      }
      break
    case 'dab':
      say(message, DAB)
      break
    case 'say':
      say(message, args.join(' '))
      break
  }
}

function say(message: Message, note?: string) {
  if (note) {
    message.channel.send(note)
  } else {
    message.channel.send(DAB + "try that again" + DAB)
  }
}

function crypto(message: Message, currency?: string) {
  if (currency) {
    getCoin(currency).then((coin) => {
      say(message, '```\n' + formatCoin(coin, 12, true) + '\n```')
    }, () => {
      say(message, "Uh oh... I had some trouble grabbing the info, try again later!")
    })
  } else {
    top10().then((coins) => {
      let formatted = '```\nTop 10 cryptos:\n\n'
      coins.forEach(coin => {
        formatted += formatCoin(coin, 12, false) + '\n'
      })
      say(message, formatted + '\n```')
    }, () => {
      say(message, "Uh oh... I had some trouble grabbing the info, try again later!")
    })
  }
}