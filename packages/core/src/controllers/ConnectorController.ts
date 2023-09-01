import { proxy } from 'valtio'
import type { Connector } from '../utils/TypeUtils.js'

// -- Types --------------------------------------------- //
export interface ConnectorControllerState {
  connectors: Connector[]
}

// -- State --------------------------------------------- //
const state = proxy<ConnectorControllerState>({
  connectors: []
})

// -- Controller ---------------------------------------- //
export const ConnectorController = {
  state,

  setConnectors(connectors: ConnectorControllerState['connectors']) {
    state.connectors = connectors
  },

  addConnector(connector: Connector) {
    state.connectors.push(connector)
  },

  removeConnectorById(connectorId: Connector['id']) {
    state.connectors = state.connectors.filter(c => c.id !== connectorId)
  }
}
