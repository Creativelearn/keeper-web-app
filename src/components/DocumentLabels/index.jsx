import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Link } from 'react-router'
import { Dropdown, Label, Icon } from 'semantic-ui-react'

import { actions as documentActions } from 'store/modules/document'

import './styles.css'

export class DocumentLabels extends React.Component {
  static propTypes = {
    doc: PropTypes.object.isRequired,
    editable: PropTypes.bool,
    labels: PropTypes.object.isRequired,
    updateDocument: PropTypes.func.isRequired
  };

  static defaultProps = {
    editable: false
  };

  constructor (props) {
    super(props)
    this.handleChange = this.handleChange.bind(this)
    this.toggleEditable = this.toggleEditable.bind(this)
    this.state = {
      editable: props.editable
    }
  }

  renderViewMode () {
    const { doc } = this.props
    const labels = doc.labels || []
    const $labels = labels.map((id) => {
      const l = this.resolveLabel(id)
      if (!l) {
        return null
      }
      const color = {color: l.color}
      const key = `label-${doc.id}-${l.id}`
      const to = {pathname: `/labels/${l.id}`}
      return (
        <Label as={Link} key={key} to={to} title={`Go to ${l.label} label page`} >
          <Icon name='circle' style={color} />
          {l.label}
        </Label>
      )
    })

    return (
      <div className='DocumentLabels' >
        <Link title='Edit labels' onClick={this.toggleEditable}>
          <Icon.Group >
            <Icon link name='tag' />
            <Icon link corner name='add' />
          </Icon.Group>
        </Link>
        <Label.Group size='mini'>
          {$labels}
        </Label.Group>
      </div>
    )
  }

  renderEditMode () {
    const { labels, doc } = this.props
    const value = doc.labels ? doc.labels : []
    const options = labels.current.labels.map((l) => {
      const color = {color: l.color}
      return {
        text: l.label,
        value: l.id,
        color: l.color,
        content: <div><Icon name='circle' style={color} /> {l.label}</div>
      }
    })
    const renderLabel = (label, index, props) => ({
      content: label.text,
      icon: <Icon name='circle' style={{color: label.color}} />
    })

    return (
      <Dropdown
        multiple
        selection
        fluid
        options={options}
        placeholder='No label'
        renderLabel={renderLabel}
        defaultValue={value}
        onChange={this.handleChange}
      />
    )
  }

  render () {
    const { editable } = this.state
    return editable ? this.renderEditMode() : this.renderViewMode()
  }

  toggleEditable () {
    const { editable } = this.props
    this.setState({editable: !editable})
  }

  handleChange (event, {value}) {
    const { updateDocument, doc } = this.props
    const payload = {
      labels: value
    }
    updateDocument(doc, payload)
  }

  resolveLabel (id) {
    const { labels } = this.props.labels.current
    return labels ? labels.find((l) => l.id === id) : null
  }
}

const mapStateToProps = (state) => ({
  labels: state.labels
})

const mapDispatchToProps = (dispatch) => (
  bindActionCreators(Object.assign({}, documentActions), dispatch)
)

export default connect(mapStateToProps, mapDispatchToProps)(DocumentLabels)
