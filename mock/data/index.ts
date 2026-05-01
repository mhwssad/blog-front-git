import seq from './seq.json'
import auth from './auth.json'
import content from './content.json'
import system from './system.json'
import user from './user.json'
import follow from './follow.json'
import file from './file.json'
import chat from './chat.json'
import ai from './ai.json'

const testData = {
  ...seq,
  ...auth,
  ...content,
  ...system,
  ...user,
  ...follow,
  ...file,
  ...chat,
  ...ai,
}

export default testData

export { default as menusData } from './menus.json'
