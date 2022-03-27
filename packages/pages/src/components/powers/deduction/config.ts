import baseurl from '../../../modules/baseurl'

const createDeductionConfig = (fetcherInput: fetcherOptions): DeductionFetch.deductionFetcherConfig => {
  if (fetcherInput.type === 'admin') {
    return {
      type: 'admin',
      getter: baseurl + 'admin/get/all/deduction?password=' + fetcherInput.password,
      deleter: baseurl + 'admin/del/deduction',
      creater: false,
      callbacker: false,
      decliner: false,
      standardConfig: fetcherInput,
    }
  } else if (fetcherInput.type === 'member_admin') {
    return {
      type: 'member_admin',
      getter: baseurl + `member/admin/${fetcherInput.number}/get/all/deduction?password=` + fetcherInput.password,
      deleter: baseurl + `member/admin/${fetcherInput.number}/del/deduction`,
      creater: false,
      callbacker: false,
      decliner: false,
      standardConfig: fetcherInput,
    }
  } else if (fetcherInput.type === 'member') {
    return {
      type: 'member',
      getter: baseurl + `member/deduction/${fetcherInput.number}/work/get/deduction?password=` + fetcherInput.password,
      deleter: baseurl + `member/deduction/${fetcherInput.number}/work/del/deduction`,
      creater: baseurl + `member/deduction/${fetcherInput.number}/work/new/deduction`,
      decliner: baseurl + `member/deduction/${fetcherInput.number}/work/turnd/deduction`,
      callbacker: false,
      standardConfig: fetcherInput,
      name: fetcherInput.name,
    }
  } else {
    return {
      type: 'class',
      getter: baseurl + `class/${fetcherInput.gradeid}/${fetcherInput.classid}/get/deduction?password=` + fetcherInput.password,
      deleter: false,
      creater: false,
      callbacker: baseurl + `class/new/feedback`,
      decliner: false,
      standardConfig: fetcherInput,
    }
  }
}

export { createDeductionConfig }
