import { IArchivist } from '../../@types'
import { configurationQuery } from './queries'
import { configurationMutation } from './mutations'
import { get } from 'lodash'

export default () => ({
  Query: configurationQuery(),
  Mutation: configurationMutation(),
  Archivist: {
    id: (archivist: IArchivist) => `http://${get(archivist, 'dns')}:${get(archivist, 'port')}`
  }
})
