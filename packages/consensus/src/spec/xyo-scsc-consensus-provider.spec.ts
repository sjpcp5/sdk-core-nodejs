/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Monday, 25th February 2019 10:20:31 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-scsc-consensus-provider.spec.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Monday, 11th March 2019 12:55:20 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoScscConsensusProvider } from '../xyo-scsc-consensus-provider'
import { XyoIpfsClient, XyoIpfsClientCtorOptions } from '@xyo-network/ipfs-client'
import { XyoWeb3Service } from '@xyo-network/web3-service'
import { BN, fileExists, readFile } from '@xyo-network/utils'
import { IAppConfig } from '@xyo-network/app'
import path from 'path'
import yaml from 'js-yaml'

jest.setTimeout(1000000)

describe('Consensus', async () => {
  let consensus: any
  let account: string

  beforeEach(async () => {
    const configName = 'kevinlocal'
    const rootPath = path.resolve(__dirname, '../../../app/')

    const configFolder = path.resolve(rootPath, 'config')
    const configPath = path.resolve(configFolder, `${configName}.yaml`)
    const exists = await fileExists(configPath)
    expect(exists).toEqual(true)
    console.log(`Loaded Configuration name: ${configName}`)

    const file = await readFile(configPath, 'utf8')
    const config = yaml.safeLoad(file) as IAppConfig

    const host = config.diviner!.ethereum.host
    account = config.diviner!.ethereum.account.address
    const privateKey = config.diviner!.ethereum.account.privateKey

    const web3Service = new XyoWeb3Service(
      host,
      new XyoIpfsClient(config.ipfs),
      config.diviner!.ethereum.contracts!,
      account,
      privateKey)

    consensus = new XyoScscConsensusProvider(web3Service)
  })
  async function delay(delayInms: number) {
// tslint:disable-next-line: no-shadowed-variable
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(2)
      }, delayInms)
    })
  }

  describe("SCSC", () => {
    it('Should get request by id', async () => {
      const req = await consensus.getRequestById(1)
      console.log("getRequestById", req)
      expect(req.requestSender).toEqual(account)

      // let huh2 = await consensus.getRequestById(2)
      // console.log("2nd time works?", huh2)
      // await delay(100);

      // let huh3 = await consensus.getRequestById(3)
      // console.log("how bout 3?", huh3)
      // await delay(100);

    })
    it('Should get all requests', async () => {
      const allR = await consensus.getNextUnhandledRequests()
      console.log("getAllRequests", allR)
      expect(allR[1].requestSender).toEqual(account)
    })

    it('Should get last block hash', async () => {

      const result = await consensus.getLatestBlockHash()
      console.log("getLatestBlockHash", result)
      expect(result.toString()).toEqual("0")
    })
    it('getNetworkActiveStake', async () => {
      const result = await consensus.getNetworkActiveStake()
      console.log("getNetworkActiveStake", result)
      expect(result.toString()).toEqual("0")
    })
    it('getStakerActiveStake', async () => {

      const result = await consensus.getStakerActiveStake(1, account)
      console.log("getStakerActiveStake", result)
      expect(result.toString()).toEqual("0")
    })
    it('isBlockProducer', async () => {
      const result = await consensus.isBlockProducer(1)
      console.log("isBlockProducer", result)
      expect(result).toEqual(false)
    })
    it('getRewardPercentages', async () => {
      const result = await consensus.getRewardPercentages()
      console.log("getRewardPercentages", result)
    })
    it('getStakeQuorumPct', async () => {
      const result = await consensus.getStakeQuorumPct()
      console.log("getStakeQuorumPct", result)
    })
    it('canSubmitBlock', async () => {
      const result = await consensus.canSubmitBlock("0xF816F48b6841DE40285Ba5BD5eF6aACC1cb15A12")
      console.log("GOT RESULT", result)
    })
    // 114739,40965,229503,
    it.only('submitBlock', async () => {
      const args = [
        "0x0000000000000000000000000000000000000000000000000000000000000000",
        1432,
        ["0x0000000000000000000000000000000000000000000000000000000000000001"],
        "0x36f56b42d506e57b491cf4642ac0c12a452d57b8d4b56606923493e33b38a9f8",
        Buffer.from('0x00'),
        [account],
        ['0x811c624db74ad42e15faa488f2944e78b208fdc55f78bddbc983723d4b670c47'],
        ['0x65d130f3b625471a6ea130d628af07e25e2623fb26bc2094f5bc3665871a7011'],
        [28]
      ]
      console.log("TEST ARGS", args)

      const encodeBlock = await consensus.encodeBlock(...args)
      console.log("Encoding Block", encodeBlock)

      const result = await consensus.submitBlock(...args)
      console.log("TEST RESULT", result)
      expect(encodeBlock).toEqual(result)
    })
  })
})