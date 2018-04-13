import React, { Component } from 'react';
import { StyleSheet, Text, View, ScrollView, ToastAndroid, TouchableOpacity } from 'react-native';
import { connect } from 'react-redux';
import PouchDB from 'pouchdb-react-native';
import _ from 'lodash';
import moment from 'moment';
import { MainMenu, Button, Card } from './common';
import { Actions, ActionConst } from 'react-native-router-flux';
import Config from '../config';
import AuthActions from '../actions/auth';
import { UpdateSyncDoc } from '../utils';

const localAppDB = new PouchDB(Config.db.localDB_AppData, {adapter: 'asyncstorage'});
const remoteAppDB = new PouchDB(Config.db.remoteDB);

const { updateUser, memberChanged, getCurrentUserAsync, getMemberAsync, systemDataChanged, updateMember } = AuthActions;

class Main extends Component {

  DBRepilcator = null;

  componentDidMount() {
    this.props.getCurrentUserAsync()
    .then(user => {
      if(user){
        //this.replication();
        this.props.systemDataChanged();
      } else {
        Actions.auth({type: ActionConst.RESET});
      }
    })
    .catch(err => {
      console.log(err);
      Actions.auth({type: ActionConst.RESET});
    });
  }

  replication = member => {
    if(this.DBRepilcator){
      this.DBRepilcator.cancel();
    }
    this.DBRepilcator = PouchDB.replicate(localAppDB, remoteAppDB,
      {
          live: true,
          retry: true
      })
      .on('change', (info) => {
        console.log('replicating', info);
        info.docs.forEach((rec) => {
            UpdateSyncDoc(rec._id, this.props.updateMember);
        });
      })
      .on('paused', function (info) {
      console.log('paused', info);
    }).on('active', function (info) {
      console.log('active', info);
    })
      .on('error', info => {
          console.log('Replication to Remote Error', info);
          ToastAndroid.showWithGravity('Error replicating your data', 
          ToastAndroid.SHORT, ToastAndroid.BOTTOM);
      });
  };

  newMember = () => {
    Actions.personal();
  }

  openMenu = () => {
    this.refs.menu.refs.mainMenu.openDrawer();
};

  render() {
    return (
      <MainMenu 
            id={'mainMenu'}
            ref={'menu'}
            info={{ user: this.props.user }}
      >
        <ScrollView style={{ flex: 1 }}>
          <View style={{ flex: 1 }}>
            {this.props.user ? (
              <View>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#3a6a75', alignSelf: 'center', marginTop: 30}}>
              Welcome {this.props.user.firstname}!</Text>
              <View style={{ marginTop: 30, marginBottom: 20, marginLeft: 20, marginRight: 20, backgroundColor: '#fff',
              borderRadius: 10, elevation: 4, padding: 10, flexDirection: 'row'}}>
                <View style={{ marginRight: 30, marginLeft: 30}}>
                </View>
              </View>
              </View>
            ) : (null)}
          <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', marginBottom: 3, marginTop: 3, marginLeft: 10, marginRight: 10 }}>
            <View style={{ flex: 1}}>
              <Card text='New Member' icon='&#xf007;' color='#50b6a6' onPress={this.newMember}/>
            </View>
            <View style={{ flex: 1}}>
              <Card text='All Members' icon='&#xf0c0;' color='#5079b6' onPress={() => Actions.allmembers()}/>
            </View>
          </View>
          <View style={{ flexDirection: 'row', marginBottom: 3, marginTop: 3, marginLeft: 10, marginRight: 10 }}>
            <View style={{ flex: 1}}>
              <Card text='Complaints' icon='&#xf071;' color='#b65c50'/>
            </View>
            <View style={{ flex: 1}}>
              <Card text='FAQs' icon='&#xf059;' color='#73b650'/>
            </View>
          </View>
          </View>
          </View>
        </ScrollView>
      </MainMenu>
    );
  }
}

const mapStateToProps = state => ({
  user: state.auth.user,
  member: state.auth.member
});

export default connect(mapStateToProps, { updateUser, memberChanged, getCurrentUserAsync, getMemberAsync, systemDataChanged,
  updateMember })(Main);
