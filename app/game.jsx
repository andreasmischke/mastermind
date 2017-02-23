import _ from 'lodash';
import React from 'react';
import ReactDOM from 'react-dom';
import interact from 'interactjs';

class Cell extends React.Component {

    render() {
        return (
            <div className="cell"
                 data-color={this.props.color}>
            </div>
        );
    }
};

class ActiveRowCell extends React.Component {

    setColor(e) {
        const newColor = this.props.selectedColor || undefined;
        this.props.onClick(newColor);
    }

    dropEnter(e) {
        this.setState({selected: true});
    }

    dropLeave(e) {
        this.setState({selected: undefined});
    }

    drop(e) {
        var color = e.relatedTarget.getAttribute('data-color');
        this.props.onClick(parseInt(color));
    }

    componentDidMount() {
        const node = ReactDOM.findDOMNode(this);
        node.addEventListener('click', this.setColor.bind(this));
        interact(node).dropzone({
            ondragenter: this.dropEnter.bind(this),
            ondragleave: this.dropLeave.bind(this),
            ondrop: this.drop.bind(this)
        });
    }

    render() {
        return <div className="cell" data-color={this.props.color} />
    }

}

class ColorTrayCell extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            color: this.props.color,
            dragging: false,
            dragx: 0,
            dragy: 0
        };
    }

    dragStart(e) {
        this.setState({dragging: true});
    }

    dragMove(e) {
        this.setState(function(prevState) {
            return {
                dragx: prevState.dragx + e.dx,
                dragy: prevState.dragy + e.dy
            };
        });
    }

    dragEnd(e) {
        this.setState({dragging: false, dragx: 0, dragy: 0});
    }

    select(e) {
        if(this.props.selected) {
            this.props.onClick(0);
        } else {
            this.props.onClick(this.state.color);
        }
    }

    componentDidMount() {
        const node = ReactDOM.findDOMNode(this);
        node.addEventListener('click', this.select.bind(this));
        interact(node).draggable({
            onstart: this.dragStart.bind(this),
            onmove: this.dragMove.bind(this),
            onend: this.dragEnd.bind(this)
        });
    }

    render() {
        let className = 'cell';
        if(this.props.selected) {
            className += ' cell_selected';
        }
        if(this.state.dragging) {
            const x = this.state.dragx,
                  y = this.state.dragy,
                  style = {transform: `translate(${x}px, ${y}px)`},
                  dragging_cell = (
                <div className='cell dragging_cell'
                     style={style}
                     data-color={this.state.color} />
            );
            return (
                <div className={className}
                     data-color={this.state.color}>
                    {dragging_cell}
                </div>
            );
        } else {
        return (
            <div className={className}
                 data-color={this.state.color} />
        );
        }
    }
}

class Marker extends React.Component {
    render() {
        const hits = this.props.markers[0],
              matches = this.props.markers[1],
              wrongs = 4 - hits - matches;

        const hitMarkers = _.range(hits).map(function(i) {
            return <div className='marker hit' key={i} />
        });
        const matchMarkers = _.range(matches).map(function(i) {
            return <div className='marker match' key={hits+i} />
        });
        const wrongMarkers = _.range(wrongs).map(function(i) {
            return <div className='marker' key={hits+matches+i} />
        });
        return (
            <div className='marker_box'>
                {hitMarkers}
                {matchMarkers}
                {wrongMarkers}
            </div>
        );
    }
};

class PendingRow extends React.Component {
    render() {
        return (
            <div className='row'>
                <div className='pointer' />
                <Cell key="0" color={0} />
                <Cell key="1" color={0} />
                <Cell key="2" color={0} />
                <Cell key="3" color={0} />
            </div>
        );
    }
}

class DoneRow extends React.Component {
    render() {
        return (
            <div className='row done'>
                <div className='pointer' />
                <Cell key="0" color={this.props.colors[0]} />
                <Cell key="1" color={this.props.colors[1]} />
                <Cell key="2" color={this.props.colors[2]} />
                <Cell key="3" color={this.props.colors[3]} />
                <Marker markers={this.props.markers} />
            </div>
        );
    }
}

class ActiveRow extends React.Component {

    render() {
        return (
            <div className='row active'>
                <div className='pointer' />
                {_.range(4).map((i) => {
                    const partialClick = _.partial(this.props.onCellClick,
                                                   i);
                    return <ActiveRowCell key={i}
                                   color={this.props.colors[i]}
                                   onClick={partialClick}
                                   selectedColor={this.props.selectedColor} />
                })}
                <CheckBox onClick={this.props.onCheck} />
            </div>
       );
    }
}

class CheckBox extends React.Component {
    render() {
        return (
            <div className='check_box' onClick={this.props.onClick}>
                <div className='check' />
            </div>
        );
    }
}

class ColorTray extends React.Component {

    render() {
        return (
            <div className='color_tray'>
            {_.range(1, 7).map((i) =>
                <ColorTrayCell key={i}
                      color={i}
                      selected={i == this.props.selectedColor}
                      onClick={this.props.onCellClick}
                      selectable />
            )}
            </div>
        );
    }
}

class GameBoard extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            target: this.shuffle(),
            activeRow: this.props.activeRow || 1,
            selectedColor: undefined,
            colors: [0,0,0,0],
            doneRows: []
        };
    }

    setColor(index, color) {
        this.setState((prevState) => {
            const colors = prevState.colors;
            colors[index] = color;
            return {
                colors: colors,
                selectedColor: 0
            };
        });
    }

    setSelectedColor(color) {
        this.setState({selectedColor: color});
    }

    shuffle() {
        return _.times(4, _.partial(_.random, 1, 6, false));
    }

    componentDidMount() {
        this.scrollIntoView(1);
    }

    render() {
        const pendingRows = _.range(12, this.state.activeRow).map((id) => {
            return <PendingRow key={id} />;
        });
        const activeRow = (
            <ActiveRow key={this.state.activeRow}
                       colors={this.state.colors}
                       selectedColor={this.state.selectedColor}
                       onCellClick={this.setColor.bind(this)}
                       onCheck={this.next.bind(this)} />
        );
        const doneRows = _.range(this.state.activeRow - 1, 0).map((id) => {
            const rowData = this.state.doneRows[id.toString()],
                  colors = rowData.colors,
                  markers = rowData.markers;
            return <DoneRow key={id} 
                            colors={colors}
                            markers={markers} />;
        });
        return (
            <div className='gameboard'>
                {pendingRows}
                {activeRow}
                {doneRows}
                <ColorTray onCellClick={this.setSelectedColor.bind(this)}
                           selectedColor={this.state.selectedColor} />
            </div>
        );
    }

    scrollIntoView(row) {
        const firstRow = ReactDOM.findDOMNode(this).firstChild,
              heightPerRow = firstRow.offsetHeight;
        window.scrollTo(window.scrollX, heightPerRow * (11-row));
    }

    checkRow() {
        let hits = 0,
            matches = 0,
            target = _.clone(this.state.target),
            colors = _.clone(this.state.colors);
        console.warn(target, colors);
        [target, colors] = _.unzip(_.zip(target, colors).reduce((acc, i) => {
            if(i[0] == i[1]) {
                hits += 1;
                return acc;
            } else {
                return acc.concat([i]);
            }
        }, []));

        if(target === undefined && colors === undefined) {
            return [hits, 0];
        }

        console.log('checkRow', target, colors);
        matches = target.reduce((acc, color) => {
            const index = colors.indexOf(color);
            console.info(color, 'has index', index);
            if(index > -1) {
                colors.splice(index, 1);
                console.info('colors now', colors);
                console.info('incrementing to', acc + 1);
                return acc + 1;
            } else {
                console.info('matches stay ', acc);
                return acc;
            }
        }, 0);

        return [hits, matches];
    }

    next() {
        const markers = this.checkRow();
        this.setState((prevState) => {
            const oldRow = prevState.activeRow,
                  doneRows = prevState.doneRows,
                  colors = prevState.colors,
                  newRow = _.clamp(oldRow + 1, 1, 12);
            this.scrollIntoView(newRow);
            doneRows[oldRow.toString()] = {
                colors: colors,
                markers: markers
            };
            return {
                activeRow: newRow,
                doneRows: doneRows,
                colors: [0,0,0,0]
            };
        });

    };
};

module.exports = GameBoard;
