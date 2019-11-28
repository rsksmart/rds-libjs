import { swarm as swarmProvider } from '../../../src'
import { SwarmStorage } from '../../../src/types'

import chai from 'chai'
import dirtyChai from 'dirty-chai'
import chaiAsPromised from 'chai-as-promised'
import { Bzz } from '@erebos/api-bzz-node'
import * as utils from '../../../src/utils'

// Do not reorder these statements - https://github.com/chaijs/chai/issues/1298
chai.use(chaiAsPromised)
chai.use(dirtyChai)
const expect = chai.expect

describe('Swarm provider', () => {
  let provider: SwarmStorage
  let bzz: Bzz

  before(async () => {
    provider = swarmProvider({
      url: 'http://localhost:8500'
    })
    bzz = provider.bzz

    try {
      await bzz.upload('test')
    } catch (e) {
      if (e.name === 'FetchError' && e.message.includes('ECONNREFUSED')) {
        expect.fail('Swarm node is not running! Cannot run tests. ')
      }
    }
  })

  describe('.put()', () => {
    it('should store file', async () => {
      const hash = await provider.put(Buffer.from('hello world'))

      const result = await bzz.download(hash, { mode: 'raw' })
      expect(await result.text()).to.equal('hello world')
    })

    it('should store directory with flat structure', async () => {
      const file = { data: Buffer.from('data') }

      const dir = {
        file: file,
        'other-file': file
      }

      const rootCid = await provider.put(dir)
      const result = await bzz.downloadDirectoryData(rootCid)
      expect(Object.keys(result).length).to.eq(2)

      // @ts-ignore
      Object.values(result).forEach(entry => entry.data && expect(entry.data.toString()).to.eq('data'))

      expect(Object.keys(result)).to.include.members([
        'file',
        'other-file'
      ])
    })

    // TODO: https://github.com/MainframeHQ/erebos/issues/125
    it.skip('should store directory with empty folder', async () => {
      const file = { data: Buffer.from('') }

      const dir = {
        'folder/empty/': file
      }

      const rootCid = await provider.put(dir)
      const result = await bzz.downloadDirectoryData(rootCid)
      expect(Object.keys(result).length).to.eq(1)

      // @ts-ignore
      Object.values(result).forEach(entry => entry.data && expect(entry.data.toString()).to.eq('data'))

      expect(Object.keys(result)).to.include.members(['folder/empty/'])
    }).timeout(20000)

    it('should store directory with nested directories', async () => {
      const file = { data: Buffer.from('data') }

      const dir = {
        file: file,
        'other-file': file,
        'folder/and/file': file
      }

      const rootCid = await provider.put(dir)
      expect(rootCid).to.be.a('string')

      const result = await bzz.downloadDirectoryData(rootCid)
      expect(Object.keys(result).length).to.eq(3)

      // @ts-ignore
      Object.values(result).forEach(entry => entry.data && expect(entry.data.toString()).to.eq('data'))
      expect(Object.keys(result)).to.include.members([
        'file',
        'folder/and/file',
        'other-file'
      ])
    })
  })

  describe('.get()', () => {
    it('should get raw file', async () => {
      const hash = (await bzz.uploadFile(Buffer.from('hello world')))

      const fetched = await provider.get(hash)
      expect(utils.isFile(fetched)).to.be.true()
      expect(fetched.toString()).to.equal('hello world')
    })

    it('should get content-typed file', async () => {
      const hash = (await bzz.uploadFile(Buffer.from('hello world'), { contentType: 'plain/text' }))

      const fetched = await provider.get(hash)
      expect(utils.isFile(fetched)).to.be.true()
      expect(fetched.toString()).to.equal('hello world')
    })

    // it('should throw when not found', () => {
    //   const cid = 'QmY2ERw3nB19tVKKVF18Wq5idNL91gaNzCk1eaSq6S1J1i'
    //
    //   return expect(provider.get(cid)).to.be.eventually.fulfilled()
    // })

    it('should get flat directory', async () => {
      const file = { data: Buffer.from('some-data') }

      const dir = {
        file: file,
        'other-file': file
      }
      const result = await bzz.uploadDirectory(dir)

      const fetched = await provider.get(result)
      expect(utils.isDirectory(fetched)).to.be.true()

      expect(fetched).to.have.all.keys(
        [
          'file',
          'other-file',
          utils.DIRECTORY_SYMBOL
        ]
      )

      Object.values(fetched).forEach(file => expect(file).to.eql({
        size: 9,
        data: Buffer.from('some-data')
      }))
    })
  })
})
