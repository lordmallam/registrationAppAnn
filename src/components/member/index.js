import React, { Component } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput,
DatePickerAndroid, ToastAndroid, ListView } from 'react-native';
import { connect } from 'react-redux';
import { Actions } from 'react-native-router-flux';
import _ from 'lodash';
import PouchDB from 'pouchdb-react-native';
import moment from 'moment';
import { Button, TextBox, Dropdown, SuccessModalView, ErrorModalView, MainMenu, Header, ConfirmModal } from '../common'
import Config from '../../config';
import { IsUndefinedOrNull, UpdateSyncDoc } from '../../utils';
import AuthActions from '../../actions/auth';

const localAppDB = new PouchDB(Config.db.localDB_AppData, {adapter: 'asyncstorage'});
const remoteAppDB = new PouchDB(Config.db.remoteDB);
const { memberListChanged, membersChanged, selectedMemberChanged, updateMember } = AuthActions;
class Members extends Component {
    DBRepilcator = null;
    ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
    state = {
        showErrorModal: false,
        showModal: false,
        dataSource: this.ds.cloneWithRows([]),
        count: 0,
        selectedMember: null
    }

    componentDidMount() {
        localAppDB.allDocs()
        .then(res => {
            let members = res.rows.filter(m => (m.doc.doc_type === Config.docTypes.prospect && !m.doc.is_deleted)).map(r => (r.doc));
            members = _.reverse(_.sortBy(members, (o) => (
                new Date(o.modifiedOn)
            )));
            this.props.membersChanged(members);
            this.setState({
                dataSource: this.ds.cloneWithRows(members),
                count: members.length
            });
        })
        .catch(err=>console.log(err))
        this.replication();
    }

    componentWillReceiveProps(newProps) {
        if(newProps.states !== this.props.states || newProps.lgas !== this.props.lgas) {
            
        }

        if (newProps.memberList !== this.props.memberList) {
            localAppDB.allDocs()
        .then(res => {
            let members = res.rows.filter(m => (m.doc.doc_type === Config.docTypes.prospect && !m.doc.is_deleted)).map(r => (r.doc));
            members = _.reverse(_.sortBy(members, (o) => (
                new Date(o.modifiedOn)
            )));
            this.setState({
                dataSource: this.ds.cloneWithRows(members),
                count: members.length
            });
        })
        .catch(err=>console.log(err))
        }
    }


    setList =() => {
        
    };


    replication = () => {
        // if(this.DBRepilcator){
        //     this.DBRepilcator.cancel();
        //   }
        this.DBRepilcator = PouchDB.replicate(localAppDB, remoteAppDB,
          {
              live: true,
              retry: true
          })
          .on('change', (info) => {
            info.docs.forEach((rec) => {
                UpdateSyncDoc(rec._id, this.props.memberListChanged);
            });
          })
          .on('error', info => {
              console.log('Replication to Remote Error', info);
              ToastAndroid.showWithGravity('Error replicating your data', 
              ToastAndroid.SHORT, ToastAndroid.BOTTOM);
          });
      };

    setDoB = async () => {
        try {
            const setDate = new Date();
            if(this.state.dob !== 'Date of birth') {
                setDate = new Date(this.state.dob);
            }
            const {action, year, month, day} = await DatePickerAndroid.open({
              date: setDate
            });
            if (action !== DatePickerAndroid.dismissedAction) {
                month = month + 1;
                if (day > 0 && day <= 9) {
                    day = `0${day}`;
                }
                if (month > 0 && month <= 9) {
                    month = `0${month}`;
                }
                this.setState({
                    dob: moment(new Date(`${year}-${month}-${day}`))
                    .format('DD MMMM, YYYY')
                });
            }
          } catch ({code, message}) {
            console.warn('Cannot open date picker', message);
          }
    };

    onRegister = () => {
        
    };

    onSetModalVisible = visible => {
        this.setState({
            showModal: visible
        });
    };

    onSetErrorModalVisible = visible => {
        this.setState({
            showErrorModal: visible
        });
    };

    onRequestClose = () => {};

    openMenu = () => {
        this.refs.menu.refs.mainMenu.openDrawer();
    };

    getStateById = Id => {
        if(this.props.states.length){
            const foundState = _.first(this.props.states.filter(state => (state._id === Id)));
            return foundState ? foundState.name : '---'
        } else {return '--'}
    };

    getLGAById = Id => {
        if(this.props.lgas.length){
            const foundlga = _.first(this.props.lgas.filter(lga => (lga._id === Id)));
            return foundlga ? foundlga.name : '---'
        } else {return '--'}
    };

    edit = rec => {
        this.props.selectedMemberChanged(rec);
        Actions.editProfile();
    }

    delete = rec => {
        this.setState({error: `Are you sure you want to delete
        ${rec.firstname} ${rec.surname}?`,
            selectedMember: rec
        });
        this.onSetErrorModalVisible(true);
    }

    onConfirm = () => {
        const s = {...this.state.selectedMember};
        s.is_deleted = true;
        this.props.updateMember(s);
        this.onSetErrorModalVisible(false);
    };

    renderRow = rec => {
        if (rec) {
            return (
            <View style={{backgroundColor: '#fff', flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#ededed'}}>
            <View style={{flex: 1, flexDirection: 'row'}}>
            <View style={[{width: 10, backgroundColor: '#cf0202'}, rec.isSynced ? {backgroundColor: '#28a417'} : {}]}>
            </View>    
            <View style={{paddingHorizontal: 10, paddingVertical: 5}}>
                <Text style={{ fontSize: 15 }}>{rec.firstname} {rec.surname}</Text>
                <Text style={{fontSize: 11, fontStyle: 'italic', color: '#808080', fontWeight: 'bold'}}>
                {this.getStateById(rec.state)} | {this.getLGAById(rec.lga)} | {moment(new Date(rec.dateOfBirth)).format('DD MMM, YY')}
                </Text>
            </View>
            </View>
            <View style={{ flexDirection: 'row' }}>
            <TouchableOpacity onPress={() => this.edit(rec)}
            style={{ width: 50, backgroundColor: '#f1f1f1', justifyContent: 'center', borderRightColor: '#e7e7e7', borderRightWidth: 1 }}>
                <Text style={{ fontFamily: 'fa-solid', fontSize: 15, color: '#9e9e9e', alignSelf: 'center' }}>&#xf303;</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => this.delete(rec)}
            style={{ width: 50, backgroundColor: '#f1f1f1', justifyContent: 'center' }}>
                <Text style={{ fontFamily: 'fa-solid', fontSize: 15, color: '#9e9e9e', alignSelf: 'center' }}>&#xf2ed;</Text>
            </TouchableOpacity>
            </View>
            </View>
            );
        }
        return (<Text style={{ alignSelf: 'center', fontWeight: 'bold'}}>Loading members...</Text>);
    };

    render() {
        return(
            <MainMenu 
                id={'mainMenu'}
                ref={'menu'}
                info={{ user: this.props.user }}
            >
                <Header pageName={`Registered Members (${this.state.count})`} openMenu={this.openMenu} icon='&#xf0fe;' action={()=>Actions.personal()}/>
                <ScrollView>
                    <View style={{ flex: 1 }}>
                    <ConfirmModal
                    message={this.state.error}
                    confirmText='Delete'
                    onConfirm={() => this.onConfirm()}
                    title='Delete Member'
                    visible={this.state.showErrorModal}
                    buttonColor={{backgroundColor: '#b02323'}}
                    onToggle={this.onSetErrorModalVisible}
                    />
                    <SuccessModalView
                        visible={this.state.showModal} onRequestClose={this.onRequestClose}
                        style={{ flex: 1, padding: 0 }}
                        >                    
                        <View style={{ padding: 20 }}>
                        <Text style={{ fontSize: 20, color: '#338fc2', alignSelf: 'center'}}>Registration Submitted!</Text>
                        <Text style={{ fontSize: 15, fontWeight: 'bold', alignSelf: 'center', marginTop: 20, marginBottom: 20, textAlign: 'center'}}>
                        Check your email and follow the link to compelet the registration process.</Text>
                        <Button 
                            Text='Okay'
                            style={{
                            backgroundColor: '#73b650',
                            marginLeft: 30,
                            marginRight: 30,
                            flex: 0,
                            borderRadius: 10,
                            elevation: 2
                            }} />
                        </View>
                    </SuccessModalView>
                    <View style={{ marginTop: 15 }}>
                    <ListView
                    enableEmptySections
                    dataSource={this.state.dataSource}
                    renderRow={this.renderRow}
                    />
                    </View>
                    </View>
                </ScrollView>
            </MainMenu>
        );
    };
}

const style = {
    textStyle: {
        fontSize: 15
    },
    logoStyle: {
        width: 70,
        height: 70,
        marginBottom: 10,
        marginTop: 15,
        alignSelf: 'center'
    },
    border: {
        borderBottomWidth: 1,
        borderBottomColor: '#c0c0c0',
        marginLeft: 5,
        marginRight: 5,
        marginTop: 5
    }
};

const mapStateToProps = state => ({
    memberList: state.auth.memberList,
    user: state.auth.user,
    states: state.auth.states,
    lgas: state.auth.lgas
});
  
export default connect(mapStateToProps, {memberListChanged, membersChanged, selectedMemberChanged, updateMember})(Members);