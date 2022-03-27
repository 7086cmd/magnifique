import axios from 'axios'
import deduction from '../../../../examples/deduction'
import { createDeductionConfig } from './config'

class DeductionFetcher {
  options: DeductionFetch.deductionFetcherConfig

  deductionExample: deduction

  constructor(option: fetcherOptions) {
    this.options = createDeductionConfig(option)
    this.deductionExample = deduction()
    if (option.type === 'member') {
      this.deductionExample.deductor.number = option.number
      this.deductionExample.deductor.name = option.name
    }
  }

  get = async () => {
    return (await axios(this.options.getter)).data
  }

  delete = async (deductionDeleteData: { id: string; unviolatedPersonNumber: number }) => {
    if (this.options.deleter) {
      return (
        await axios(this.options.deleter, {
          method: 'post',
          data: {
            ...this.options.standardConfig,
            id: deductionDeleteData.id,
            person: deductionDeleteData.unviolatedPersonNumber,
          },
        })
      ).data
    } else
      return {
        status: 'error',
        reason: 'no-auth',
      }
  }

  callback = async (deductionDeleteData: { id: string; descriptionMessage: string }) => {
    if (this.options.callbacker) {
      return (
        await axios(this.options.callbacker, {
          method: 'post',
          data: {
            ...this.options.standardConfig,
            id: deductionDeleteData.id,
            msg: deductionDeleteData.descriptionMessage,
          },
        })
      ).data
    } else
      return {
        status: 'error',
        reason: 'no-auth',
      }
  }

  create = async (deductionCreatement: deduction) => {
    if (this.options.creater && this.options.standardConfig.type === 'member') {
      return (
        await axios(this.options.creater, {
          method: 'post',
          data: {
            ...this.options.standardConfig,
            id: Number(this.options.standardConfig.number),
            content: JSON.parse(JSON.stringify(deductionCreatement)),
          },
        })
      ).data
    } else
      return {
        status: 'error',
        reason: 'no-auth',
      }
  }

  decline = async (deductionDeclineData: { id: string; violater: number; message: string }) => {
    if (this.options.decliner) {
      return (
        await axios(this.options.decliner, {
          method: 'post',
          data: {
            ...this.options.standardConfig,
            person: deductionDeclineData.violater,
            reason: deductionDeclineData.message,
            id: deductionDeclineData.id,
          },
        })
      ).data
    } else
      return {
        status: 'error',
        reason: 'no-auth',
      }
  }
}

export { DeductionFetcher }
