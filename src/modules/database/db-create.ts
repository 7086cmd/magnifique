import { tmpdir } from 'os'
import { mkdirSync, existsSync } from 'fs'
import { resolve } from 'path'
import { sha512 } from 'js-sha512'
import transformDate from '../utils/transform-date'
import dataSave from '../utils/data-save'

const generateRoot = () => {
  const tpth = resolve(tmpdir(), '../magnifique/')
  if (!existsSync(tpth)) {
    mkdirSync(tpth)
  }
  return tpth
}

const generateAdminPassword = (basep: string) => {
  if (!existsSync(resolve(basep, './password.sdbdata'))) {
    dataSave(resolve(basep, './password.sdbdata'), {
      secret: {
        password: sha512('secret'),
      },
    })
  }
}

const generateAdminFolder = (basep: string) => {
  const tpth = resolve(basep, './admin/')
  if (!existsSync(tpth)) {
    mkdirSync(tpth)
  }
  return tpth
}

const generateFeedbackFolder = (basep: string) => {
  const tpth = resolve(basep, './feedback/')
  if (!existsSync(tpth)) {
    mkdirSync(tpth)
  }
  return tpth
}

const generateGradeFolder = (basep: string, gradeid: number) => {
  const tpth = resolve(basep, String(transformDate(gradeid)))
  if (!existsSync(tpth)) {
    mkdirSync(tpth)
  }
  return tpth
}

const generateClassFolder = (basep: string, classid: number) => {
  const tpth = resolve(basep, String(classid))
  if (!existsSync(tpth)) {
    mkdirSync(tpth)
  }
  return tpth
}

const generateClassMemberFolder = (basep: string) => {
  const tpth = resolve(basep, './members')
  if (!existsSync(tpth)) {
    mkdirSync(tpth)
  }
  return tpth
}

const generateClassDetail = (basep: string, file: string) => {
  if (!existsSync(resolve(basep, `./${file}.sdbdata`))) {
    dataSave(resolve(basep, `./${file}.sdbdata`), {
      details: {},
    })
  }
}

const generateClassPassword = (basep: string, gradeid: number, classid: number) => {
  if (!existsSync(resolve(basep, './password.sdbdata'))) {
    dataSave(resolve(basep, './password.sdbdata'), {
      password: sha512(String(transformDate(gradeid) * 100 + classid)),
    })
  }
}

export default () => {
  const rt = generateRoot()
  for (let i = 1; i <= 3; i++) {
    const basep = generateGradeFolder(rt, i)
    for (let j = 1; j <= 15; j++) {
      const bsec = generateClassFolder(basep, j)
      generateClassPassword(bsec, i, j)
      generateClassMemberFolder(bsec)
      generateClassDetail(bsec, 'deduction')
      generateClassDetail(bsec, 'post')
      generateClassDetail(bsec, 'activity')
      generateClassDetail(bsec, 'orgnize')
      generateClassDetail(bsec, 'radio')
      generateClassDetail(bsec, 'volunteer')
    }
  }
  generateAdminPassword(generateAdminFolder(rt))
  generateFeedbackFolder(rt)
}
