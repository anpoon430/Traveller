import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import Button from '@material-ui/core/Button';
import { AppBar, TextField } from '@material-ui/core';
import SearchBox from './SearchBox';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import PropTypes from 'prop-types';
import Badge from '@material-ui/core/Badge';
import { fade } from '@material-ui/core/styles/colorManipulator';
import { withStyles } from '@material-ui/core/styles';
import MoreIcon from '@material-ui/icons/MoreVert';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

import SearchIcon from '@material-ui/icons/Search';
import GpsFixed from '@material-ui/icons/GpsFixedOutlined';

import RouteIcon from '@material-ui/icons/Directions';

import TimerIcon from '@material-ui/icons/Timer';
import TimerOffIcon from '@material-ui/icons/TimerOff';
import {fetchDistanceMatix, setReachability} from './Redux/markers';

function msToTime(s) {

  // Pad to 2 or 3 digits, default is 2
  function pad(n, z) {
    z = z || 2;
    return ('00' + n).slice(-z);
  }

  var ms = s % 1000;
  s = (s - ms) / 1000;
  var secs = s % 60;
  s = (s - secs) / 60;
  var mins = s % 60;
  var hrs = (s - mins) / 60;

  return pad(hrs) + ':' + pad(mins) + ':' + pad(secs);
}



const styles = theme => ({
  root: {
    width: '100%',
    color: 'white',
  },
  spacing: {
    display: 'flex',
    justifyContent: 'center'
  },
  grow: {
    flexGrow: 1,
  },
  menuButton: {
    marginLeft: -12,
    marginRight: 20,
  },
  title: {
    display: 'none',
    [theme.breakpoints.up('sm')]: {
      display: 'block',
    },
  },
  search: {
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: fade(theme.palette.common.white, 0.15),
    '&:hover': {
      backgroundColor: fade(theme.palette.common.white, 0.25),
    },
    marginRight: theme.spacing.unit * 2,
    marginLeft: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      marginLeft: theme.spacing.unit * 3,
      width: 'auto',
    },
  },
  searchIcon: {
    width: theme.spacing.unit * 9,
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputRoot: {
    color: 'white',
    width: '100%',
  },
  inputInput: {
    paddingTop: theme.spacing.unit,
    paddingRight: theme.spacing.unit,
    paddingBottom: theme.spacing.unit,
    paddingLeft: theme.spacing.unit * 10,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: 200,
    },
  },
  sectionDesktop: {
    display: 'none',
    [theme.breakpoints.up('md')]: {
      display: 'flex',
    },
  },
  sectionMobile: {
    display: 'flex',
    [theme.breakpoints.up('md')]: {
      display: 'none',
    },
  },
  timerInput:{
    width: 50,
    marginRight: 5,
    color: 'white'
  }
});

const convertTime = (timeObj) => {
  const time = {
    'h': 3600000,
    'm': 60000,
    's': 1000,
  }
  let miliseconds = Number(timeObj.h)*time.h
  + Number(timeObj.m)*time.m + Number(timeObj.s)*time.s;
  return miliseconds;
}


class Nav extends Component {
  constructor(props){
    super(props);
    this.state = {
      timer: {
        input: {
          h: 0,
          m: 0,
          s: 0
        },
        started: false,
        anchorEl: null,
        mobileMoreAnchorEl: null,
      },
      timeLeft: 0
    }
    this.distMatrixIntervalId = 1;
    }

    handleProfileMenuOpen = event => {
      this.setState({ anchorEl: event.currentTarget });
    };

    handleMenuClose = () => {
      this.setState({ anchorEl: null });
      this.handleMobileMenuClose();
    };

    handleMobileMenuOpen = event => {
      this.setState({ mobileMoreAnchorEl: event.currentTarget });
    };

    handleMobileMenuClose = () => {
      this.setState({ mobileMoreAnchorEl: null });
    };
  handleChange = (evt) => {
    this.setState({
      timer: {
        input: {
          ...this.state.timer.input,
        [evt.target.name]: evt.target.value
       }}
      }
    );
  }
  handleClick = () => {
    this.setState((state) => {
      return {
        ...state,
        timer: {
          input: {...state.timer.input},
          started: !state.timer.started
        }
      }
    }, async() => {
      const {timer} = this.state;
      const {h, m, s} = timer.input;
      if (this.state.timer.started){

        let convertedTime = convertTime({h, m, s});

        this.timerInterval = 0;
        this.start = Date.now();
        this.timeToStopAt = convertedTime + this.start;
        this.setState({
          timeLeft: this.timeToStopAt
        });
        let currentTimeRemaining = this.timeToStopAt - Date.now();
        this.startTimer();

        await this.loadTimeAndReach();
        this.distMatrixIntervalId = setInterval(async()=>{
          await this.loadTimeAndReach()
        }, 30000);

      } else {
        clearInterval(this.timerInterval);
        clearInterval(this.distMatrixIntervalId);
      }
    })
  }
  loadTimeAndReach = async() =>{
    let currentTimeRemaining = this.timeToStopAt - Date.now();
    let {origin, markers} = this.props;
        if (markers.length){
          console.log('setting time data!!!!!!')
          try {
            await this.props.setTimeData(origin);
            this.props.getReachability(Math.floor(currentTimeRemaining/1000));
          } catch (error) {
            console.error(error)
          }
        }
  }
  startTimer(){
    this.timerInterval = setInterval(() => {
      this.setState((state)=>{
      return {timeLeft: state.timeLeft - 1000}
    }
  )}, 1000);
  }
  renderTime(){
    let currentTimeRemaining = this.timeToStopAt - Date.now();
    console.log(formattedTime);
    let formattedTime = msToTime(currentTimeRemaining);
    if ( currentTimeRemaining > 0 && this.state.timer.started) return <span>{formattedTime}</span>
    clearInterval(this.timerInterval);
    return <span>00:00:00</span>
  }
  render(){
    const { classes, googlemap, centerButton } = this.props;
    const { anchorEl, mobileMoreAnchorEl } = this.state;

    const {timer} = this.state;
    const {h, m, s} = timer.input;
    const isMenuOpen = Boolean(anchorEl);
    const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);
    const renderTimer = (
      <Fragment>
        <TextField
                    style = {{color:'white'}}
                    className={classes.timerInput}
                    label = 'HH'
                    type= 'number'
                    name = 'h'
                    onChange = {this.handleChange}
                    value = {this.state.timer.input.h || 0}
                    />
                  <TextField
                    className={classes.timerInput}
                    label = 'MM'
                    type= 'number'
                    name = 'm'
                    onChange = {this.handleChange}
                    value = {this.state.timer.input.m || 0}
                    />
                  <TextField
                    className={classes.timerInput}
                    label = 'SS'
                    type= 'number'
                    name = 's'
                    onChange = {this.handleChange}
                    value = {this.state.timer.input.s || 0}
                    />
                    <IconButton>
                      {
                        this.state.timer.started ?
                        <TimerOffIcon onClick={this.handleClick} />
                        : <TimerIcon onClick={this.handleClick}/>
                      }
                    </IconButton>
      </Fragment>
    )

    const renderTimerDisplay = (
      <div style = {{display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', lineHeight: '8vh'}}>
        {this.renderTime()}
      </div>
    )

    const renderMenu = (
      <Menu
        anchorEl={anchorEl}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        open={isMenuOpen}
        onClose={this.handleMenuClose}
      >

      </Menu>
    );

    const renderMobileMenu = (
      <Menu
        anchorEl={mobileMoreAnchorEl}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        open={isMobileMenuOpen}
        onClose={this.handleMenuClose}
      >
        <MenuItem onClick={this.handleMobileMenuClose}>
          {renderTimer}
        </MenuItem>
        <MenuItem
          style =  {{textAlign: 'center'}}
        onClick={this.handleMobileMenuClose}>
          {renderTimerDisplay}
        </MenuItem>
        <MenuItem onClick={this.handleProfileMenuOpen}>
        <IconButton
                      onClick={this.loadTimeAndReach}>
                      <RouteIcon />
                    </IconButton>
          <p>Get travel times</p>
        </MenuItem>
      </Menu>
    );



    return (
      <div >
        <AppBar position='fixed' className = {classes.root} id = "appbar">
          <Toolbar className={classes.spacing}>
            <IconButton
              onClick={centerButton}>
              <GpsFixed />
            </IconButton>
            <div className={classes.search}>
                <div className={classes.searchIcon}>
                  <SearchIcon />
                </div>
                {googlemap && googlemap.places &&
                <SearchBox />}
              </div>
            <div className={classes.grow}></div>
          <div className = {classes.sectionDesktop}>
                {renderTimer}
                {renderTimerDisplay}
                <IconButton
                      onClick={this.loadTimeAndReach}>
                      <RouteIcon />
                    </IconButton>
              </div>
              <div className={classes.sectionMobile}>
              <IconButton aria-haspopup="true" onClick={this.handleMobileMenuOpen} color="inherit">
                <MoreIcon />
              </IconButton>
            </div>
          </Toolbar>
        </AppBar>
        {renderMenu}
        {renderMobileMenu}
      </div>
    )
  }
}



Nav.propTypes = {
  classes: PropTypes.object.isRequired,
};

const mapState = ({markers, map}) => ({
  googlemap: map.maps,
  markers: markers.list
})

const mapDispatch = (dispatch) => ({
  setTimeData(...args){
    dispatch(fetchDistanceMatix(...args));
  },
  getReachability(timeLeft){
    dispatch(setReachability(timeLeft));
  }
})

export default withStyles(styles)(connect(mapState, mapDispatch)(Nav));
