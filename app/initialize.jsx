document.addEventListener('DOMContentLoaded', function() {
    const React = require('react'),
          ReactDOM = require('react-dom'),
          GameBoard = require('game');

    ReactDOM.render(
        <GameBoard />,
        document.getElementById('mastermind')
    );

    window._ = require('lodash');
});
