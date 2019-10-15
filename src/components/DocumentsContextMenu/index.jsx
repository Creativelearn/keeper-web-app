/*eslint new-cap: ["error", { "newIsCap": false }]*/

import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import { Dropdown } from 'semantic-ui-react'
import * as Mousetrap from 'mousetrap'

import { bindActions } from 'store/helper'

import { routerActions as RouterActions } from 'react-router-redux'
import { actions as DocumentsActions } from 'store/modules/documents'
import { actions as GraveyardActions } from 'store/modules/graveyard'
import LabelActions from 'store/label/actions'
import { actions as NotificationActions } from 'store/modules/notification'

export class DocumentsContextMenu extends React.Component {
  static propTypes = {
    actions: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    documents: PropTypes.object.isRequired,
    label: PropTypes.object.isRequired,
    items: PropTypes.string
  };

  mousetrap = new Mousetrap.default();

  constructor (props) {
    super(props)
    this.handleRefresh = this.handleRefresh.bind(this)
    this.handleOrderSwitch = this.handleOrderSwitch.bind(this)
    this.handleRemoveLabel = this.handleRemoveLabel.bind(this)
    this.handleUndoRemoveLabel = this.handleUndoRemoveLabel.bind(this)
    this.handleEmptyGraveyard = this.handleEmptyGraveyard.bind(this)
  }

  componentDidMount () {
    this.bindKeys()
  }

  componentWillUnmount () {
    this.unBindKeys()
  }

  bindKeys () {
    this.unBindKeys()
    this.mousetrap.bind(['r'], this.handleRefresh)
    this.mousetrap.bind(['o'], this.handleOrderSwitch)
  }

  unBindKeys () {
    this.mousetrap.unbind('r')
    this.mousetrap.unbind('o')
  }

  key (name) {
    return `menu-${name}`
  }

  get label () {
    const { label } = this.props
    return label.current
  }

  get refreshMenuItem () {
    return (
      <Dropdown.Item
        icon='refresh'
        key={this.key('refresh')}
        onClick={this.handleRefresh}
        text='Refresh [r]'
      />
    )
  }

  get orderMenuItem () {
    const { documents } = this.props
    const asc = documents.params && documents.params.order === 'asc'
    const text = asc ? 'From most recent [o]' : 'From oldest [o]'
    const order = asc ? 'ascending' : 'descending'
    return (
      <Dropdown.Item
        icon={`sort numeric ${order}`}
        key={this.key('order')}
        onClick={this.handleOrderSwitch}
        text={text} />
    )
  }

  get editLabelMenuItem () {
    const { location } = this.props
    if (this.label) {
      return (
        <Dropdown.Item
          icon='tag'
          as={Link}
          key={this.key('edit-label')}
          to={{ pathname: `/labels/${this.label.id}/edit`, state: {modal: true, returnTo: location, title: `Edit label: ${this.label.label}`} }}
          text='Edit label' />
      )
    }
  }

  get deleteLabelMenuItem () {
    if (this.label) {
      return (
        <Dropdown.Item
          icon='trash'
          as='a'
          key={this.key('delete-label')}
          onClick={this.handleRemoveLabel}
          text='Delete label' />
      )
    }
  }

  get emptyGraveyardMenuItem () {
    return (
      <Dropdown.Item
        icon='trash'
        as='a'
        key={this.key('empty-graveyard')}
        onClick={this.handleEmptyGraveyard}
        text='Empty the trash' />
    )
  }

  get shareLabelMenuItem () {
    const { location } = this.props
    if (this.label) {
      return (
        <Dropdown.Item
          icon='share alternate'
          as={Link}
          key={this.key('share-label')}
          to={{ pathname: `/labels/${this.label.id}/share`, state: {modal: true, returnTo: location, title: `Share label: ${this.label.label}`} }}
          text='Share label' />
      )
    }
  }

  get dividerMenuItem () {
    return (<Dropdown.Divider key={this.key('divider' + Math.random())} />)
  }

  get menu () {
    const { items } = this.props
    return items.split(',').map((item) => {
      return this[item + 'MenuItem']
    })
  }

  render () {
    return (
      <Dropdown.Menu>
        {this.menu}
      </Dropdown.Menu>
    )
  }

  handleRefresh () {
    const { actions, documents } = this.props
    const { params } = documents
    params.from = 0
    actions.documents.fetchDocuments(params)
  }

  handleOrderSwitch () {
    const { actions, documents } = this.props
    const { params } = documents
    params.order = params.order && params.order === 'asc' ? 'desc' : 'asc'
    params.from = 0
    actions.documents.fetchDocuments(params)
  }

  handleRemoveLabel () {
    const { actions } = this.props
    actions.label.removeLabel(this.label)
    .then(label => {
      actions.router.push({pathname: '/documents'})
      actions.notification.showNotification({
        message: 'Label deleted',
        actionLabel: 'undo',
        actionFn: () => this.handleUndoRemoveLabel()
      })
    }).catch((err) => {
      actions.notification.showNotification({
        header: 'Unable to delete label',
        message: err.error,
        level: 'error'
      })
    })
  }

  handleUndoRemoveLabel () {
    const { actions } = this.props
    actions.label.restoreRemovedLabel().then((label) => {
      actions.router.push({pathname: `/labels/${label.id}`})
      actions.notification.showNotification({header: 'Label restored'})
    }).catch((err) => {
      actions.notification.showNotification({
        header: 'Unable to restore label',
        message: err.error,
        level: 'error'
      })
    })
  }

  handleEmptyGraveyard () {
    const { actions } = this.props
    actions.graveyard.emptyGraveyard().then(() => {
      actions.notification.showNotification({header: 'The trash is emptied'})
    }).catch((err) => {
      actions.notification.showNotification({
        header: 'Unable to empty the trash',
        message: err.error,
        level: 'error'
      })
    })
  }
}

const mapStateToProps = (state) => ({
  location: state.router.locationBeforeTransitions,
  documents: state.documents,
  label: state.label
})

const mapActionsToProps = (dispatch) => (bindActions({
  documents: DocumentsActions,
  graveyard: GraveyardActions,
  label: LabelActions,
  notification: NotificationActions,
  router: RouterActions
}, dispatch))

export default connect(mapStateToProps, mapActionsToProps)(DocumentsContextMenu)
